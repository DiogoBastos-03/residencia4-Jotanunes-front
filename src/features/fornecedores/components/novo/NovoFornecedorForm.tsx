import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useObrasApi, useVincularFornecedor } from '@/entities/obra';
import { mensagemDoErro } from '@/shared/api';
import { paths } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { AlertBox, Button, ButtonLink, PageHeader, Stack, useToast } from '@/shared/ui';
import { useCnpjCadastrado } from '../../hooks/useCnpjCadastrado';
import { useCadastrarFornecedor } from '../../hooks/useMutacoesFornecedor';
import { errosDaApi, limparErrosDaApi, SEM_ERROS_DA_API, validarCnpj, validarDados, type ErrosDaApi } from '../../lib';
import type { ErrosFormFornecedor, NovoFornecedor } from '../../types';
import { BlocoIdentificacao } from './BlocoIdentificacao';
import { BlocoObra } from './BlocoObra';
import { SeletorTipos } from './SeletorTipos';

const t = strings.pages.fornecedorNovo;

const VAZIO: NovoFornecedor = { cnpj: '', razaoSocial: '', telefone: '', email: '', tipos: [], obraId: '', prazoDias: '' };

function validar(d: NovoFornecedor): ErrosFormFornecedor {
  const prazo = Number(d.prazoDias);
  const prazoOk = !d.obraId || (Number.isInteger(prazo) && prazo >= 1 && prazo <= 9999);
  return { cnpj: validarCnpj(d.cnpj), ...validarDados(d), prazo: prazoOk ? undefined : strings.errosApi.porCampo.prazo };
}

/**
 * Cadastro com exatamente o que o POST /enterprises aceita (razão social, CNPJ, telefone, e-mail
 * e tipos) e, opcionalmente, a obra: depois do cadastro, POST …/constructions/{obraId}/enterprises.
 *
 * São duas chamadas, sem transação entre elas (no back também não há: são dois módulos).
 * Se o vínculo falhar, o fornecedor já existe: a tela não diz "pronto" — abre a ficha dele na
 * aba Obras (que lê a API e mostra a verdade) com um aviso de erro dizendo o que faltou.
 * Abre vazio. A URL aceita ?cnpj=<14 dígitos> (usado pela /_estados).
 */
export function NovoFornecedorForm() {
  const [params] = useSearchParams();
  const cadastro = useCadastrarFornecedor();
  const vinculo = useVincularFornecedor();
  const obras = useObrasApi();
  const enviando = cadastro.isPending || vinculo.isPending;
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [dados, setDados] = useState<NovoFornecedor>({ ...VAZIO, cnpj: params.get('cnpj') ?? '' });
  const [erros, setErros] = useState<ErrosFormFornecedor>({});
  const [tentou, setTentou] = useState(false);
  const [daApi, setDaApi] = useState<ErrosDaApi>(SEM_ERROS_DA_API);
  const jaCadastrado = useCnpjCadastrado(dados.cnpj);
  // Depois do POST, a empresa recém-criada entra na lista: não é duplicado dela mesma.
  const duplicado = cadastro.isPending || cadastro.isSuccess ? null : jaCadastrado;
  const nomeObra = (obraId: string) => obras.data?.itens.find((o) => o.id === obraId)?.nome ?? '';

  const errosVisiveis: ErrosFormFornecedor = {
    ...erros,
    ...daApi.campos,
    cnpj: duplicado ? t.identificacao.cnpjDuplicado(duplicado.razaoSocial) : (daApi.campos.cnpj ?? erros.cnpj),
  };
  const temErro = (tentou && Object.values(erros).some(Boolean)) || Object.values(daApi.campos).some(Boolean);

  function mudar(parcial: Partial<NovoFornecedor>) {
    setDados((atual) => ({ ...atual, ...parcial }));
    setDaApi((atual) => limparErrosDaApi(atual, Object.keys(parcial)));
    if (tentou) setErros(validar({ ...dados, ...parcial }));
  }

  async function salvar() {
    const novosErros = validar(dados);
    setErros(novosErros);
    setDaApi(SEM_ERROS_DA_API);
    setTentou(true);
    if (duplicado || Object.values(novosErros).some(Boolean)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    let id: string;
    try {
      id = await cadastro.mutateAsync(dados);
    } catch (e) {
      setDaApi(errosDaApi(e));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const razao = dados.razaoSocial.trim();
    if (!dados.obraId) {
      showToast(strings.pages.fornecedores.novoToast(razao));
      navigate(paths.fornecedores);
      return;
    }
    const obra = nomeObra(dados.obraId);
    try {
      await vinculo.mutateAsync({ obraId: dados.obraId, fornecedorId: id, prazoDias: Number(dados.prazoDias) });
    } catch (e) {
      // Falha parcial: o fornecedor existe, o vínculo não. A ficha mostra o estado real.
      showToast(t.toastVinculoFalhou(razao, obra, mensagemDoErro(e)), 'error');
      navigate(`${paths.fornecedor(id)}?aba=obras`);
      return;
    }
    showToast(t.toastVinculado(razao, obra));
    navigate(paths.fornecedores);
  }

  return (
    <Stack>
      <PageHeader
        level="subpage"
        back={{ to: paths.fornecedores, label: t.voltar }}
        title={t.title}
        subtitle={t.subtitle}
        actions={
          <>
            <Button
              variant="tertiary"
              onClick={() => {
                setDados(VAZIO);
                setErros({});
                setDaApi(SEM_ERROS_DA_API);
                setTentou(false);
              }}
            >
              {t.limpar}
            </Button>
            <ButtonLink to={paths.fornecedores}>{t.cancelar}</ButtonLink>
            <Button variant="primary" disabled={enviando} aria-busy={enviando} onClick={() => void salvar()}>
              {enviando ? t.salvando : t.salvar}
            </Button>
          </>
        }
      />
      {duplicado && (
        <AlertBox variant="error" title={t.alertaCnpjTitle} withIcon>
          {t.alertaCnpj(duplicado.razaoSocial)}{' '}
          <Link to={paths.fornecedor(duplicado.id)} className="focus-ring rounded-control font-semibold underline underline-offset-2">
            {t.abrirFicha}
          </Link>
        </AlertBox>
      )}
      {!duplicado && daApi.topo && (
        <AlertBox variant="error" title={t.alertaApiTitle} withIcon>
          {daApi.topo}
        </AlertBox>
      )}
      {!duplicado && !daApi.topo && temErro && (
        <AlertBox variant="error" title={t.alertaErrosTitle} withIcon>
          {t.alertaErros}
        </AlertBox>
      )}
      <BlocoIdentificacao dados={dados} erros={errosVisiveis} onChange={mudar} />
      <SeletorTipos tipos={dados.tipos} onChange={(tipos) => mudar({ tipos })} erro={errosVisiveis.tipos} />
      <BlocoObra dados={dados} erros={errosVisiveis} onChange={mudar} obras={obras.data?.itens ?? []} />
    </Stack>
  );
}

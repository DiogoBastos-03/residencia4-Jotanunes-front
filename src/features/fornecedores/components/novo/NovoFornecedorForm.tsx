import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { paths } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { AlertBox, Button, ButtonLink, PageHeader, Stack, useToast } from '@/shared/ui';
import { useCnpjCadastrado } from '../../hooks/useCnpjCadastrado';
import { useCadastrarFornecedor } from '../../hooks/useMutacoesFornecedor';
import { NOVO_FORNECEDOR_VAZIO, useExemploNovoFornecedor, useObrasParaCadastro } from '../../hooks/useObrasParaCadastro';
import { emailValido, errosDaApi, limparErrosDaApi, SEM_ERROS_DA_API, validarCnpj, validarDados, type ErrosDaApi } from '../../lib';
import type { ErrosFormFornecedor, NovoFornecedor } from '../../types';
import { BlocoContato } from './BlocoContato';
import { BlocoIdentificacao } from './BlocoIdentificacao';
import { BlocoObra } from './BlocoObra';
import { SeletorTipos } from './SeletorTipos';

const t = strings.pages.fornecedorNovo;

function validar(d: NovoFornecedor): ErrosFormFornecedor {
  return {
    cnpj: validarCnpj(d.cnpj),
    ...validarDados(d),
    contatoNome: d.contato.nome.trim() ? undefined : t.contato.nomeErro,
    contatoEmail: emailValido(d.contato.email) ? undefined : t.contato.emailErro,
    servico: d.obraId && !d.servicoContratado.trim() ? t.obra.servicoErro : undefined,
  };
}

/**
 * Cadastro em quatro blocos. Abre preenchido com o exemplo; "Limpar" esvazia.
 * A URL aceita ?form=vazio e ?cnpj=<14 dígitos> — usados pela /_estados.
 * Identificação e tipos vão para a API (POST /enterprises); contato, convite e obra são demonstração.
 */
export function NovoFornecedorForm() {
  const [params] = useSearchParams();
  const exemplo = useExemploNovoFornecedor();
  const obras = useObrasParaCadastro();
  const cadastro = useCadastrarFornecedor();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const inicial = params.get('form') === 'vazio' ? NOVO_FORNECEDOR_VAZIO : exemplo;
  const [dados, setDados] = useState<NovoFornecedor>({ ...inicial, cnpj: params.get('cnpj') ?? inicial.cnpj });
  const [erros, setErros] = useState<ErrosFormFornecedor>({});
  const [tentou, setTentou] = useState(false);
  const [daApi, setDaApi] = useState<ErrosDaApi>(SEM_ERROS_DA_API);
  const jaCadastrado = useCnpjCadastrado(dados.cnpj);
  // Depois do POST, a empresa recém-criada entra na lista: não é duplicado dela mesma.
  const duplicado = cadastro.isPending || cadastro.isSuccess ? null : jaCadastrado;

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
    try {
      await cadastro.mutateAsync(dados);
    } catch (e) {
      setDaApi(errosDaApi(e));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    showToast(
      dados.enviarConvite
        ? strings.pages.fornecedores.novoToastConvite(dados.contato.email.trim())
        : strings.pages.fornecedores.novoToast(dados.razaoSocial.trim()),
    );
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
                setDados(NOVO_FORNECEDOR_VAZIO);
                setErros({});
                setDaApi(SEM_ERROS_DA_API);
                setTentou(false);
              }}
            >
              {t.limpar}
            </Button>
            <ButtonLink to={paths.fornecedores}>{t.cancelar}</ButtonLink>
            <Button variant="primary" disabled={cadastro.isPending} aria-busy={cadastro.isPending} onClick={() => void salvar()}>
              {cadastro.isPending ? t.salvando : t.salvar}
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
      <BlocoContato dados={dados} erros={errosVisiveis} onChange={mudar} />
      <BlocoObra dados={dados} erros={errosVisiveis} onChange={mudar} obras={obras} />
    </Stack>
  );
}

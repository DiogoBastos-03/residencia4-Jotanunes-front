import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { paths, USAR_API } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { AlertBox, Button, ButtonLink, PageHeader, Stack, useToast } from '@/shared/ui';
import { useAcoesFornecedor } from '../../hooks/useAcoesFornecedor';
import { useCnpjCadastrado } from '../../hooks/useCnpjCadastrado';
import { NOVO_FORNECEDOR_VAZIO, useExemploNovoFornecedor, useObrasParaCadastro } from '../../hooks/useObrasParaCadastro';
import { errosDaApi, validarCnpj, validarDados } from '../../lib';
import type { ErrosFormFornecedor, NovoFornecedor } from '../../types';
import { BlocoIdentificacao } from './BlocoIdentificacao';
import { BlocoObra } from './BlocoObra';
import { SeletorTipos } from './SeletorTipos';

const t = strings.pages.fornecedorNovo;

function validar(d: NovoFornecedor): ErrosFormFornecedor {
  return {
    cnpj: validarCnpj(d.cnpj),
    ...validarDados(d),
    servico: d.obraId && !d.servicoContratado.trim() ? t.obra.servicoErro : undefined,
  };
}

/**
 * Cadastro em três blocos, só com o que a API aceita. Na demonstração abre preenchido com o
 * exemplo ("Limpar" esvazia); com a API abre vazio.
 * A URL aceita ?form=vazio e ?cnpj=<14 dígitos> — usados pela /_estados.
 */
export function NovoFornecedorForm() {
  const [params] = useSearchParams();
  const exemplo = useExemploNovoFornecedor();
  const { obras, podeVincular } = useObrasParaCadastro();
  const { cadastrar } = useAcoesFornecedor();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Com a API o formulário abre vazio: o que for salvo vai para o banco de verdade.
  const inicial = USAR_API || params.get('form') === 'vazio' ? NOVO_FORNECEDOR_VAZIO : exemplo;
  const [dados, setDados] = useState<NovoFornecedor>({ ...inicial, cnpj: params.get('cnpj') ?? inicial.cnpj });
  const [erros, setErros] = useState<ErrosFormFornecedor>({});
  const [errosServidor, setErrosServidor] = useState<ErrosFormFornecedor>({});
  const [erroTopo, setErroTopo] = useState<string | undefined>();
  const [tentou, setTentou] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const duplicado = useCnpjCadastrado(dados.cnpj);

  const errosVisiveis: ErrosFormFornecedor = {
    ...errosServidor,
    ...Object.fromEntries(Object.entries(erros).filter(([, v]) => v)),
    cnpj: duplicado ? t.identificacao.cnpjDuplicado(duplicado.razaoSocial) : (erros.cnpj ?? errosServidor.cnpj),
  };
  const temErro = tentou && Object.values(erros).some(Boolean);

  function mudar(parcial: Partial<NovoFornecedor>) {
    setDados((atual) => ({ ...atual, ...parcial }));
    if (tentou) setErros(validar({ ...dados, ...parcial }));
    // O que a API recusou deixa de valer para o campo que mudou.
    setErrosServidor((atual) => Object.fromEntries(Object.entries(atual).filter(([campo]) => !(campo in parcial))));
  }

  async function salvar() {
    const novosErros = validar(dados);
    setErros(novosErros);
    setTentou(true);
    setErroTopo(undefined);
    if (duplicado || Object.values(novosErros).some(Boolean)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setEnviando(true);
    try {
      await cadastrar(dados);
    } catch (erro) {
      const { campos, topo } = errosDaApi(erro);
      setErrosServidor(campos);
      setErroTopo(topo);
      setEnviando(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setEnviando(false);
    showToast(strings.pages.fornecedores.novoToast(dados.razaoSocial.trim()));
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
              disabled={enviando}
              onClick={() => {
                setDados(NOVO_FORNECEDOR_VAZIO);
                setErros({});
                setErrosServidor({});
                setErroTopo(undefined);
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
      {erroTopo && (
        <AlertBox variant="error" title={t.alertaApiTitle} withIcon>
          {erroTopo}
        </AlertBox>
      )}
      {duplicado && (
        <AlertBox variant="error" title={t.alertaCnpjTitle} withIcon>
          {t.alertaCnpj(duplicado.razaoSocial)}{' '}
          <Link to={paths.fornecedor(duplicado.id)} className="focus-ring rounded-control font-semibold underline underline-offset-2">
            {t.abrirFicha}
          </Link>
        </AlertBox>
      )}
      {!duplicado && !erroTopo && temErro && (
        <AlertBox variant="error" title={t.alertaErrosTitle} withIcon>
          {t.alertaErros}
        </AlertBox>
      )}
      <BlocoIdentificacao dados={dados} erros={errosVisiveis} onChange={mudar} />
      <SeletorTipos tipos={dados.tipos} onChange={(tipos) => mudar({ tipos })} erro={errosVisiveis.tipos} />
      <BlocoObra dados={dados} erros={errosVisiveis} onChange={mudar} obras={obras} podeVincular={podeVincular} />
    </Stack>
  );
}

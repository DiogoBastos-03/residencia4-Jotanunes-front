import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { cnpjValido, paths } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { AlertBox, Button, ButtonLink, PageHeader, Stack, useToast } from '@/shared/ui';
import { useAcoesFornecedor } from '../../hooks/useAcoesFornecedor';
import { useCnpjCadastrado } from '../../hooks/useCnpjCadastrado';
import { NOVO_FORNECEDOR_VAZIO, useExemploNovoFornecedor, useObrasParaCadastro } from '../../hooks/useObrasParaCadastro';
import type { NovoFornecedor } from '../../types';
import { BlocoContato } from './BlocoContato';
import { BlocoIdentificacao } from './BlocoIdentificacao';
import { BlocoObra } from './BlocoObra';
import { BlocoTipo } from './BlocoTipo';
import type { ErrosNovoFornecedor } from './types';

const t = strings.pages.fornecedorNovo;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validar(d: NovoFornecedor): ErrosNovoFornecedor {
  return {
    cnpj: cnpjValido(d.cnpj) ? undefined : t.identificacao.cnpjErro,
    razaoSocial: d.razaoSocial.trim() ? undefined : t.identificacao.razaoErro,
    contatoNome: d.contato.nome.trim() ? undefined : t.contato.nomeErro,
    email: EMAIL.test(d.contato.email.trim()) ? undefined : t.contato.emailErro,
    servico: d.obraId && !d.servicoContratado.trim() ? t.obra.servicoErro : undefined,
  };
}

/**
 * Cadastro em quatro blocos. Abre preenchido com o exemplo; "Limpar" esvazia.
 * A URL aceita ?form=vazio e ?cnpj=<14 dígitos> — usados pela /_estados.
 */
export function NovoFornecedorForm() {
  const [params] = useSearchParams();
  const exemplo = useExemploNovoFornecedor();
  const obras = useObrasParaCadastro();
  const { cadastrar } = useAcoesFornecedor();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const inicial = params.get('form') === 'vazio' ? NOVO_FORNECEDOR_VAZIO : exemplo;
  const [dados, setDados] = useState<NovoFornecedor>({ ...inicial, cnpj: params.get('cnpj') ?? inicial.cnpj });
  const [erros, setErros] = useState<ErrosNovoFornecedor>({});
  const [tentou, setTentou] = useState(false);
  const duplicado = useCnpjCadastrado(dados.cnpj);

  const errosVisiveis: ErrosNovoFornecedor = {
    ...erros,
    cnpj: duplicado ? t.identificacao.cnpjDuplicado(duplicado.razaoSocial) : erros.cnpj,
  };
  const temErro = tentou && Object.values(erros).some(Boolean);

  function mudar(parcial: Partial<NovoFornecedor>) {
    setDados((atual) => ({ ...atual, ...parcial }));
    if (tentou) setErros(validar({ ...dados, ...parcial }));
  }

  function salvar() {
    const novosErros = validar(dados);
    setErros(novosErros);
    setTentou(true);
    if (duplicado || Object.values(novosErros).some(Boolean)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    cadastrar(dados);
    showToast(dados.enviarConvite ? strings.pages.fornecedores.novoToastConvite(dados.contato.email.trim()) : strings.pages.fornecedores.novoToast(dados.razaoSocial.trim()));
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
                setTentou(false);
              }}
            >
              {t.limpar}
            </Button>
            <ButtonLink to={paths.fornecedores}>{t.cancelar}</ButtonLink>
            <Button variant="primary" onClick={salvar}>
              {t.salvar}
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
      {!duplicado && temErro && (
        <AlertBox variant="error" title={t.alertaErrosTitle} withIcon>
          {t.alertaErros}
        </AlertBox>
      )}
      <BlocoIdentificacao dados={dados} erros={errosVisiveis} onChange={mudar} />
      <BlocoTipo dados={dados} erros={errosVisiveis} onChange={mudar} />
      <BlocoContato dados={dados} erros={errosVisiveis} onChange={mudar} />
      <BlocoObra dados={dados} erros={errosVisiveis} onChange={mudar} obras={obras} />
    </Stack>
  );
}

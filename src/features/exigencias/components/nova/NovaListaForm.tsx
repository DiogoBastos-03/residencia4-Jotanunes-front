import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import type { EscopoItem } from '@/entities';
import { paths } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { AlertBox, Button, ButtonLink, PageHeader, Stack, useToast } from '@/shared/ui';
import { useAcoesLista } from '../../hooks/useAcoesLista';
import { NOVA_LISTA_VAZIA, useExemplosExigencias } from '../../hooks/useExemplosExigencias';
import type { NovaLista } from '../../types';
import { DrawerDocumentoExigido } from '../DrawerDocumentoExigido';
import { BlocoIdentificacaoLista } from './BlocoIdentificacaoLista';
import { BlocoItensLista } from './BlocoItensLista';
import { BlocoObrasLista, type ObraComTipos } from './BlocoObrasLista';
import { BlocoPrazoLista } from './BlocoPrazoLista';

const t = strings.pages.novaLista;

/**
 * Nova lista em quatro blocos, preenchida com o exemplo. Os itens ficam em rascunho
 * até "Criar lista". A URL aceita ?tipo=material e ?form=vazio (usados pela /_estados).
 */
export function NovaListaForm({ obras }: { obras: readonly ObraComTipos[] }) {
  const [params] = useSearchParams();
  const exemplos = useExemplosExigencias();
  const { criarLista } = useAcoesLista();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const base = params.get('form') === 'vazio' ? NOVA_LISTA_VAZIA : exemplos.novaLista;
  const [dados, setDados] = useState<NovaLista>(() => ({ ...base, tipo: params.get('tipo') === 'material' ? 'material' : base.tipo }));
  const [drawer, setDrawer] = useState<EscopoItem | null>(null);
  const [erros, setErros] = useState<{ nome?: string; itens?: string }>({});

  const mudar = (parcial: Partial<NovaLista>) => setDados((atual) => ({ ...atual, ...parcial }));

  function criar() {
    const novosErros = { nome: dados.nome.trim() ? undefined : t.identificacao.nomeErro, itens: dados.itens.length ? undefined : t.itens.itensErro };
    setErros(novosErros);
    if (novosErros.nome || novosErros.itens) return;
    criarLista(dados);
    showToast(strings.pages.exigencias.criadaToast);
    navigate(paths.exigencias);
  }

  return (
    <Stack>
      <PageHeader
        level="subpage"
        back={{ to: paths.exigencias, label: t.voltar }}
        title={t.title}
        subtitle={t.subtitle}
        actions={
          <>
            <Button
              variant="tertiary"
              onClick={() => {
                setDados({ ...NOVA_LISTA_VAZIA, tipo: dados.tipo });
                setErros({});
              }}
            >
              {t.limpar}
            </Button>
            <ButtonLink to={paths.exigencias}>{t.cancelar}</ButtonLink>
            <Button variant="primary" onClick={criar}>
              {t.criar}
            </Button>
          </>
        }
      />
      {(erros.nome || erros.itens) && (
        <AlertBox variant="error" withIcon>
          {t.erros}
        </AlertBox>
      )}
      <BlocoIdentificacaoLista dados={dados} erroNome={erros.nome} onChange={mudar} onTipo={(tipo) => mudar({ tipo })} />
      <BlocoItensLista
        dados={dados}
        erro={erros.itens}
        onAdicionarDocumento={() => setDrawer('empresa')}
        onAdicionarFuncionario={() => setDrawer('funcionario')}
        onRemover={(item) => mudar({ itens: dados.itens.filter((i) => i.id !== item.id) })}
      />
      <BlocoObrasLista dados={dados} obras={obras} onChange={(obraIds) => mudar({ obraIds })} />
      <BlocoPrazoLista dados={dados} onChange={mudar} />

      <DrawerDocumentoExigido
        open={drawer !== null}
        listaNome={dados.nome || t.title}
        escopo={drawer ?? 'empresa'}
        emEdicao={null}
        exemplo={exemplos.novoDocumento}
        vazio={false}
        nomesExistentes={dados.itens.map((i) => i.nome)}
        impacto={strings.drawers.documento.impactoRascunho}
        onClose={() => setDrawer(null)}
        onSalvar={(item) => {
          mudar({ itens: [...dados.itens, item] });
          setErros((e) => ({ ...e, itens: undefined }));
          setDrawer(null);
        }}
      />
    </Stack>
  );
}

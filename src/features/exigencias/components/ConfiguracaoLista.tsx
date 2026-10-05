import { PlusIcon } from '@heroicons/react/24/outline';
import { paths } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Badge, Button, PageHeader, Stack, useToast } from '@/shared/ui';
import { useAcoesLista } from '../hooks/useAcoesLista';
import { useExemplosExigencias } from '../hooks/useExemplosExigencias';
import { useParametrosLista } from '../hooks/useParametrosLista';
import type { DetalheLista } from '../types';
import { DrawerDocumentoExigido } from './DrawerDocumentoExigido';
import { DrawerVincularObrasLista } from './DrawerVincularObrasLista';
import { ItensTabela } from './ItensTabela';
import { ModalRemoverDaObra } from './ModalRemoverDaObra';
import { ObrasDaListaBloco } from './ObrasDaListaBloco';

const t = strings.pages.lista;

/** Configuração: itens exigidos, obras vinculadas, os drawers de item e de obras. */
export function ConfiguracaoLista({ detalhe }: { detalhe: DetalheLista }) {
  const p = useParametrosLista();
  const exemplos = useExemplosExigencias();
  const { salvarItem } = useAcoesLista();
  const { showToast } = useToast();
  const { lista } = detalhe;
  const tipo = strings.dominio.tipo[lista.tipo];
  const emEdicao = detalhe.itens.find((i) => i.id === p.itemId) ?? null;
  const drawerItem = p.drawer === 'empresa' || p.drawer === 'funcionario' ? p.drawer : null;
  const escopo = emEdicao?.escopo ?? drawerItem ?? 'empresa';

  return (
    <Stack>
      <PageHeader
        level="subpage"
        back={{ to: paths.exigencias, label: t.voltar }}
        title={lista.nome}
        badges={
          <>
            <Badge status={lista.tipo} />
            <Badge status={lista.situacao} />
          </>
        }
        subtitle={t.subtitle(detalhe.itens.length, detalhe.obras, detalhe.alcance, tipo)}
        actions={
          <>
            <Button icon={PlusIcon} onClick={() => p.abrir('obras')}>
              {t.vincularObras}
            </Button>
            <Button icon={PlusIcon} onClick={() => p.abrir('empresa')}>
              {t.adicionarDocumento}
            </Button>
            <Button icon={PlusIcon} onClick={() => p.abrir('funcionario')}>
              {t.adicionarFuncionario}
            </Button>
          </>
        }
      />
      <ItensTabela
        itens={detalhe.itens}
        action={{ label: () => t.editar, describe: (i) => i.nome, onClick: (i) => p.abrir(i.escopo, i.id) }}
      />
      <ObrasDaListaBloco detalhe={detalhe} onRemover={p.setRemover} />

      <DrawerDocumentoExigido
        open={drawerItem !== null}
        listaNome={lista.nome}
        escopo={escopo}
        emEdicao={emEdicao}
        exemplo={exemplos.novoDocumento}
        vazio={p.formVazio}
        nomesExistentes={detalhe.itens.map((i) => i.nome)}
        impacto={strings.drawers.documento.impacto(detalhe.alcance, tipo, detalhe.obras, escopo)}
        onClose={p.fechar}
        onSalvar={(item) => {
          salvarItem(lista.id, item);
          showToast(emEdicao ? t.salvoToast : item.escopo === 'funcionario' ? t.funcionarioToast : t.documentoToast);
          p.fechar();
        }}
      />
      <DrawerVincularObrasLista detalhe={detalhe} open={p.drawer === 'obras'} vazio={p.formVazio} exemplo={exemplos.obrasParaVincular} onClose={p.fechar} />
      <ModalRemoverDaObra detalhe={detalhe} obraId={p.remover} onClose={() => p.setRemover(null)} />
    </Stack>
  );
}

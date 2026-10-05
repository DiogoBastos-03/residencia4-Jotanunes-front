import { strings } from '@/shared/strings';
import { Badge, Table, Tag, type TableAction, type TableColumn } from '@/shared/ui';
import type { ItemRascunho } from '../types';

const t = strings.pages.lista;

const COLUNAS: readonly TableColumn<ItemRascunho>[] = [
  { key: 'nome', header: t.colunas.item, tone: 'strong', mobile: 'title', cell: (i) => i.nome },
  {
    key: 'tipo',
    header: t.colunas.tipo,
    width: 'w-52',
    cell: (i) => (i.escopo === 'funcionario' ? <Badge status="funcionarios" /> : strings.dominio.escopo.empresa),
  },
  { key: 'obrig', header: t.colunas.obrig, width: 'w-32.5', cell: (i) => <Tag kind={i.obrigatoriedade} /> },
  {
    key: 'validade',
    header: t.colunas.validade,
    width: 'w-35',
    cell: (i) => (i.validade === 'semValidade' ? t.semValidade : i.escopo === 'funcionario' ? t.porArquivo : t.comData),
  },
  {
    key: 'aviso',
    header: t.colunas.aviso,
    width: 'w-40',
    cell: (i) => (i.validade === 'comData' && i.avisoDias ? t.aviso(i.avisoDias) : strings.common.emptyValue),
  },
];

type Props = { itens: readonly ItemRascunho[]; action: TableAction<ItemRascunho>; rowClick?: boolean };

/** Itens exigidos de uma lista: documentos da empresa e documentos de funcionário. */
export function ItensTabela({ itens, action, rowClick = true }: Props) {
  return <Table caption={t.caption} columns={COLUNAS} rows={itens} rowKey={(i) => i.id} action={action} rowClick={rowClick} />;
}

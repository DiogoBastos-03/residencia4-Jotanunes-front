import { paths } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Table, type TableColumn } from '@/shared/ui';
import type { LinhaObra } from '../types';

const t = strings.pages.obras;

const COLUNAS: readonly TableColumn<LinhaObra>[] = [
  { key: 'obra', header: t.colunas.obra, tone: 'strong', mobile: 'title', cell: (l) => l.obra.nome },
  { key: 'fornecedores', header: t.colunas.fornecedores, nowrap: true, cell: (l) => l.fornecedores },
];

/** Obras da API: nome e quantos fornecedores estão vinculados. */
export function ObrasTabela({ linhas }: { linhas: readonly LinhaObra[] }) {
  return (
    <Table
      caption={t.caption}
      columns={COLUNAS}
      rows={linhas}
      rowKey={(l) => l.obra.id}
      rowTo={(l) => paths.obra(l.obra.id)}
      action={{ label: () => t.acao, describe: (l) => l.obra.nome, to: (l) => paths.obra(l.obra.id) }}
    />
  );
}

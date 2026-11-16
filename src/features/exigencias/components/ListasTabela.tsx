import type { ListaResumo } from '@/entities/exigencias';
import { paths } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Badge, Table, type TableColumn } from '@/shared/ui';

const t = strings.pages.exigencias;

const COLUNAS: readonly TableColumn<ListaResumo>[] = [
  { key: 'nome', header: t.colunas.nome, tone: 'strong', mobile: 'title', cell: (l) => l.nome },
  { key: 'tipo', header: t.colunas.tipo, mobile: 'badge', cell: (l) => <Badge status={l.tipo} /> },
];

/** O que a listagem da API traz de cada lista: nome e tipo. */
export function ListasTabela({ listas }: { listas: readonly ListaResumo[] }) {
  return (
    <Table
      caption={t.caption}
      columns={COLUNAS}
      rows={listas}
      rowKey={(l) => String(l.id)}
      rowTo={(l) => paths.lista(l.id)}
      action={{ label: () => t.abrir, describe: (l) => l.nome, to: (l) => paths.lista(l.id) }}
    />
  );
}

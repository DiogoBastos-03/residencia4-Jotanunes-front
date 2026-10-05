import { paths } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Badge, Inline, Mono, Table, type TableColumn } from '@/shared/ui';
import type { LinhaObra } from '../types';

const t = strings.pages.obras;

const COLUNAS: readonly TableColumn<LinhaObra>[] = [
  { key: 'obra', header: t.colunas.obra, tone: 'strong', mobile: 'title', cell: (l) => l.obra.nome },
  { key: 'codigo', header: t.colunas.codigo, nowrap: true, cell: (l) => <Mono>{l.obra.codigo}</Mono> },
  { key: 'cidade', header: t.colunas.cidade, cell: (l) => strings.dominio.cidadeUf(l.obra.cidade, l.obra.uf) },
  { key: 'listas', header: t.colunas.listas, cell: (l) => l.listas },
  { key: 'fornecedores', header: t.colunas.fornecedores, cell: (l) => l.fornecedores },
  { key: 'pendencias', header: t.colunas.pendencias, cell: (l) => l.pendencias },
  {
    key: 'situacao',
    header: t.colunas.situacao,
    mobile: 'badge',
    cell: (l) => (
      <Inline gap="xs">
        <Badge status={l.obra.situacao} />
        {l.listas === 0 && <Badge status="semLista" />}
      </Inline>
    ),
  },
];

/** Obras da integração. Obra sem lista de exigências aparece marcada. */
export function ObrasTabela({ linhas }: { linhas: readonly LinhaObra[] }) {
  return (
    <Table
      caption={t.caption}
      columns={COLUNAS}
      rows={linhas}
      rowKey={(l) => l.obra.id}
      action={{ label: () => t.acao, describe: (l) => l.obra.nome, to: (l) => paths.obra(l.obra.id) }}
    />
  );
}

import { BuildingOffice2Icon } from '@heroicons/react/24/outline';
import { formatDate, paths } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Badge, ButtonLink, EmptyState, Mono, Table, type TableColumn } from '@/shared/ui';
import type { FichaFornecedor, ObraDoFornecedor } from '../types';

const t = strings.pages.fornecedor.obras;

const COLUNAS: readonly TableColumn<ObraDoFornecedor>[] = [
  { key: 'obra', header: t.colunas.obra, tone: 'strong', mobile: 'title', cell: (o) => o.obra.nome },
  { key: 'codigo', header: t.colunas.codigo, nowrap: true, cell: (o) => <Mono>{o.obra.codigo}</Mono> },
  { key: 'servico', header: t.colunas.servico, cell: (o) => o.vinculo.servicoContratado },
  {
    key: 'periodo',
    header: t.colunas.periodo,
    nowrap: true,
    cell: (o) => <Mono>{strings.pages.obra.fornecedores.periodo(formatDate(o.vinculo.inicio, 'monthYear'), formatDate(o.vinculo.fim, 'monthYear'))}</Mono>,
  },
  { key: 'listas', header: t.colunas.listas, cell: (o) => strings.dominio.documentosDe(o.listasAplicaveis, o.listasNaObra) },
  { key: 'situacao', header: t.colunas.situacao, mobile: 'badge', cell: (o) => <Badge status={o.obra.situacao} /> },
];

export function AbaObrasFornecedor({ ficha }: { ficha: FichaFornecedor }) {
  if (ficha.obras.length === 0) {
    return (
      <EmptyState
        icon={BuildingOffice2Icon}
        title={t.vazioTitle}
        description={t.vazioDescription}
        action={<ButtonLink to={paths.obras}>{t.verObras}</ButtonLink>}
      />
    );
  }
  return (
    <Table
      caption={t.caption}
      columns={COLUNAS}
      rows={ficha.obras}
      rowKey={(o) => o.obra.id}
      action={{ label: () => t.abrir, describe: (o) => o.obra.nome, to: (o) => paths.obra(o.obra.id) }}
    />
  );
}

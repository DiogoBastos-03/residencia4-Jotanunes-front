import { BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import type { FornecedorResumo } from '@/entities';
import { formatCnpj, paths } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Badge, BadgeGroup, EmptyState, Mono, Table, type TableColumn } from '@/shared/ui';

const t = strings.pages.obra.fornecedores;

const COLUNAS: readonly TableColumn<FornecedorResumo>[] = [
  { key: 'fornecedor', header: t.colunas.fornecedor, tone: 'strong', mobile: 'title', cell: (f) => f.razaoSocial },
  { key: 'cnpj', header: t.colunas.cnpj, nowrap: true, cell: (f) => <Mono>{formatCnpj(f.cnpj)}</Mono> },
  { key: 'tipo', header: t.colunas.tipo, cell: (f) => <BadgeGroup statuses={f.tipos} /> },
  { key: 'situacao', header: t.colunas.situacao, mobile: 'badge', cell: (f) => (f.bloqueado ? <Badge status="bloqueado" /> : null) },
];

/** Fornecedores vinculados à obra, como a listagem da API devolve. */
export function FornecedoresDaObra({ fornecedores }: { fornecedores: readonly FornecedorResumo[] }) {
  if (fornecedores.length === 0) return <EmptyState icon={BuildingStorefrontIcon} title={t.vazioTitle} description={t.vazioDescription} />;
  return (
    <Table
      caption={t.caption}
      columns={COLUNAS}
      rows={fornecedores}
      rowKey={(f) => f.id}
      rowTo={(f) => paths.fornecedor(f.id)}
      action={{ label: () => t.abrir, describe: (f) => f.razaoSocial, to: (f) => paths.fornecedor(f.id) }}
    />
  );
}

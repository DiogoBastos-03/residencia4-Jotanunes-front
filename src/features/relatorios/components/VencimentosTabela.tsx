import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import type { Vencimento } from '@/entities';
import { formatDate, paths } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Badge, EmptyState, Heading, Mono, Stack, Table, type TableColumn } from '@/shared/ui';

const t = strings.pages.relatorios.vencimentos;

const COLUNAS: readonly TableColumn<Vencimento>[] = [
  { key: 'data', header: t.colunas.data, width: 'w-30', nowrap: true, cell: (v) => <Mono>{formatDate(v.validade, 'date')}</Mono> },
  { key: 'doc', header: t.colunas.documento, tone: 'strong', mobile: 'title', cell: (v) => v.documentoNome },
  { key: 'fornecedor', header: t.colunas.fornecedor, cell: (v) => v.fornecedor.razaoSocial },
  { key: 'faltam', header: t.colunas.faltam, width: 'w-35', nowrap: true, cell: (v) => strings.dominio.faltam(v.diasRestantes) },
  {
    key: 'situacao',
    header: t.colunas.situacao,
    width: 'w-40',
    mobile: 'badge',
    cell: (v) => <Badge status={v.diasRestantes < 0 ? 'vencido' : 'venceEmBreve'} />,
  },
];

export function VencimentosTabela({ vencimentos }: { vencimentos: readonly Vencimento[] }) {
  return (
    <Stack gap="sm" as="section">
      <Heading>{t.title}</Heading>
      {vencimentos.length === 0 ? (
        <EmptyState icon={CalendarDaysIcon} title={t.vazioTitle} description={t.vazioDescription} />
      ) : (
        <Table
          caption={t.caption}
          columns={COLUNAS}
          rows={vencimentos}
          rowKey={(v) => v.documentoId}
          rowTo={(v) => paths.fornecedor(v.fornecedor.id)}
        />
      )}
    </Stack>
  );
}

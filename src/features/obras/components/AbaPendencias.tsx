import { CheckBadgeIcon } from '@heroicons/react/24/outline';
import type { Pendencia } from '@/entities';
import { strings } from '@/shared/strings';
import { Badge, EmptyState, Heading, Inline, Stack, Table, Text, type TableColumn } from '@/shared/ui';
import type { FichaObra } from '../types';

const t = strings.pages.obra.pendencias;

const COLUNAS: readonly TableColumn<Pendencia>[] = [
  {
    key: 'pendencia',
    header: t.colunas.pendencia,
    tone: 'strong',
    mobile: 'title',
    cell: (p) => (p.kind === 'funcionario' ? t.documentoDe(p.documentoNome, p.funcionarioNome) : p.documentoNome),
  },
  {
    key: 'tipo',
    header: t.colunas.tipo,
    width: 'w-50',
    cell: (p) => (p.kind === 'funcionario' ? strings.dominio.documentoFuncionario : strings.dominio.documentoEmpresa),
  },
  { key: 'por', header: t.colunas.exigidoPor, width: 'w-65', cell: (p) => (p.kind === 'funcionario' ? p.itemNome : p.listaNome) },
  { key: 'situacao', header: t.colunas.situacao, width: 'w-30', mobile: 'badge', cell: (p) => <Badge status={p.status} /> },
  { key: 'aberto', header: t.colunas.emAberto, width: 'w-27.5', nowrap: true, cell: (p) => strings.dominio.emAberto(p.emAbertoDias) },
];

export function AbaPendencias({ ficha }: { ficha: FichaObra }) {
  if (ficha.pendencias.length === 0) {
    return <EmptyState icon={CheckBadgeIcon} title={t.vazioTitle} description={t.vazioDescription} />;
  }
  return (
    <Stack>
      <Text size="support" tone="muted">
        {t.intro}
      </Text>
      {ficha.pendencias.map((grupo) => (
        <Stack key={grupo.fornecedor.id} gap="sm">
          <Inline gap="sm">
            <Heading level={3}>{grupo.fornecedor.razaoSocial}</Heading>
            <Text as="span" size="support" tone="muted">
              {t.contagem(grupo.pendencias.length)}
            </Text>
          </Inline>
          <Table caption={t.caption(grupo.fornecedor.razaoSocial)} columns={COLUNAS} rows={grupo.pendencias} rowKey={(p) => p.key} />
        </Stack>
      ))}
    </Stack>
  );
}

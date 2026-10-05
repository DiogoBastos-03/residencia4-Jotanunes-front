import { CheckBadgeIcon } from '@heroicons/react/24/outline';
import type { Pendencia } from '@/entities';
import { paths } from '@/shared/lib';
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
    cell: (p) => (
      <>
        {p.documentoNome}
        {p.kind === 'funcionario' && (
          <Text as="span" size="label" tone="muted" className="block font-normal">
            {t.arquivos(p.semArquivos, p.reprovados, p.vencidos)}
          </Text>
        )}
      </>
    ),
  },
  { key: 'tipo', header: t.colunas.tipo, width: 'w-50', cell: (p) => strings.dominio.escopo[p.kind] },
  { key: 'por', header: t.colunas.exigidoPor, width: 'w-65', cell: (p) => p.listaNome },
  { key: 'situacao', header: t.colunas.situacao, width: 'w-30', mobile: 'badge', cell: (p) => <Badge status={p.status} /> },
  { key: 'aberto', header: t.colunas.emAberto, width: 'w-27.5', nowrap: true, cell: (p) => strings.dominio.emAberto(p.emAbertoDias) },
];

/** O que falta, por fornecedor. O que tem arquivo abre a análise em modo leitura, com a obra como origem. */
export function AbaPendencias({ ficha }: { ficha: FichaObra }) {
  if (ficha.pendencias.length === 0) {
    return <EmptyState icon={CheckBadgeIcon} title={t.vazioTitle} description={t.vazioDescription} />;
  }
  const origem = { tipo: 'obra' as const, id: ficha.obra.id, aba: 'pendencias' };
  const destino = (p: Pendencia) =>
    p.kind === 'empresa' ? (p.documentoId ? paths.analise(p.documentoId, origem) : undefined) : p.envioId ? paths.envio(p.envioId, origem) : undefined;
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
          <Table
            caption={t.caption(grupo.fornecedor.razaoSocial)}
            columns={COLUNAS}
            rows={grupo.pendencias}
            rowKey={(p) => p.key}
            action={{
              label: () => t.ver,
              describe: (p) => p.documentoNome,
              disabled: (p) => destino(p) === undefined,
              to: (p) => destino(p) ?? paths.obra(ficha.obra.id, 'pendencias'),
            }}
          />
        </Stack>
      ))}
    </Stack>
  );
}

import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { usePainelPendencias, type LinhaPendencias } from '@/entities/pendencias';
import { paths, useDocumentTitle, useResultado } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { AsyncContent, EmptyState, Metric, MetricStrip, Mono, PageHeader, SkeletonMetricStrip, SkeletonTable, Stack, Table, Text, type TableColumn } from '@/shared/ui';

const t = strings.pages.pendencias;

const numero = (n: number) => <Mono className={n === 0 ? 'text-ink-4' : undefined}>{n}</Mono>;

const COLUNAS: readonly TableColumn<LinhaPendencias>[] = [
  { key: 'fornecedor', header: t.colunas.fornecedor, tone: 'strong', mobile: 'title', cell: (l) => l.fornecedorNome },
  { key: 'pendentes', header: t.colunas.pendentes, nowrap: true, cell: (l) => numero(l.pendentes) },
  { key: 'aVencer', header: t.colunas.aVencer, nowrap: true, cell: (l) => numero(l.aVencer) },
  { key: 'vencidas', header: t.colunas.vencidas, nowrap: true, cell: (l) => numero(l.vencidas) },
  { key: 'postergadas', header: t.colunas.postergadas, nowrap: true, cell: (l) => numero(l.postergadas) },
];

/**
 * GET /pending-panel: uma linha por fornecedor com exigência vigente, com as contagens que o back
 * calcula. Não é paginado. Sem ação de postergar: as rotas existem, mas pedem o id do envio mais
 * recente do documento, e nenhuma rota da API devolve envios hoje (ver INTEGRACAO.md).
 */
export function PendenciasPage() {
  useDocumentTitle(t.title);
  const query = useResultado(usePainelPendencias(), { empty: [] });

  return (
    <Stack>
      <PageHeader title={t.title} subtitle={t.subtitle} />
      <AsyncContent
        query={query}
        skeleton={
          <Stack>
            <SkeletonMetricStrip />
            <SkeletonTable rows={5} columns={5} />
          </Stack>
        }
        isEmpty={(linhas) => linhas.length === 0}
        empty={<EmptyState icon={CheckCircleIcon} title={t.vazioTitle} description={t.vazioDescription} />}
      >
        {(linhas) => {
          const soma = (f: (l: LinhaPendencias) => number) => linhas.reduce((n, l) => n + f(l), 0);
          const com = (f: (l: LinhaPendencias) => number) => linhas.filter((l) => f(l) > 0).length;
          return (
            <Stack>
              <MetricStrip>
                <Metric label={t.totais.pendentes} tone="warn" value={soma((l) => l.pendentes)} hint={t.totaisHint(com((l) => l.pendentes))} />
                <Metric label={t.totais.aVencer} tone="pending" value={soma((l) => l.aVencer)} hint={t.totaisHint(com((l) => l.aVencer))} />
                <Metric label={t.totais.vencidas} tone="danger" value={soma((l) => l.vencidas)} hint={t.totaisHint(com((l) => l.vencidas))} />
                <Metric label={t.totais.postergadas} value={soma((l) => l.postergadas)} hint={t.totaisHint(com((l) => l.postergadas))} />
              </MetricStrip>
              <Table
                caption={t.caption}
                columns={COLUNAS}
                rows={linhas}
                rowKey={(l) => l.fornecedorId}
                rowTo={(l) => paths.fornecedor(l.fornecedorId)}
                action={{ label: () => t.abrir, describe: (l) => l.fornecedorNome, to: (l) => paths.fornecedor(l.fornecedorId) }}
              />
              <Text size="support" tone="faint">
                {t.nota}
              </Text>
            </Stack>
          );
        }}
      </AsyncContent>
    </Stack>
  );
}

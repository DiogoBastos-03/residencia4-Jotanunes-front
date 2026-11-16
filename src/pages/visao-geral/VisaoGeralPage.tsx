import { BuildingOffice2Icon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useResumoCadastro } from '@/features/obras';
import { paths, useDocumentTitle } from '@/shared/lib';
import { strings } from '@/shared/strings';
import {
  AsyncContent,
  Block,
  BlockRowLink,
  ButtonLink,
  EmptyState,
  Icon,
  Metric,
  MetricStrip,
  PageHeader,
  SkeletonBlock,
  SkeletonMetricStrip,
  Stack,
  Text,
} from '@/shared/ui';

const t = strings.pages.visaoGeral;

/**
 * Só o que dá para calcular a partir da API: empresas (total, ativas, bloqueadas, por tipo),
 * obras e empresas por obra. Métricas de documento, fila, vencimentos e análises voltam
 * quando os endpoints de acervo e de análise existirem.
 */
export function VisaoGeralPage() {
  useDocumentTitle(t.title);
  const query = useResumoCadastro();
  return (
    <Stack>
      <PageHeader title={t.title} subtitle={t.subtitle} />
      <AsyncContent
        query={query}
        skeleton={
          <Stack>
            <SkeletonMetricStrip />
            <SkeletonBlock rows={4} />
          </Stack>
        }
      >
        {(resumo) => (
          <Stack>
            <MetricStrip>
              <Metric label={t.metricas.empresas} value={resumo.empresas.total} hint={t.metricas.empresasHint(resumo.empresas.servico, resumo.empresas.material)} />
              <Metric label={t.metricas.ativas} value={resumo.empresas.ativas} tone="ok" />
              <Metric label={t.metricas.bloqueadas} value={resumo.empresas.bloqueadas} tone="danger" />
              <Metric label={t.metricas.obras} value={resumo.obras.length} />
            </MetricStrip>
            <Block title={t.porObra.title} action={<ButtonLink to={paths.obras} variant="tertiary" size="sm">{t.porObra.action}</ButtonLink>}>
              {resumo.obras.length === 0 ? (
                <EmptyState icon={BuildingOffice2Icon} title={t.porObra.emptyTitle} description={t.porObra.emptyDescription} framed={false} />
              ) : (
                <ul>
                  {resumo.obras.map((l) => (
                    <li key={l.obra.id}>
                      <BlockRowLink to={paths.obra(l.obra.id)}>
                        <Text weight="medium" className="min-w-0 flex-1">
                          {l.obra.nome}
                        </Text>
                        <Text as="span" size="support" tone="muted" className="tabular">
                          {t.porObra.quantidade(l.fornecedores)}
                        </Text>
                        <Icon icon={ChevronRightIcon} size={16} className="row-affordance" />
                      </BlockRowLink>
                    </li>
                  ))}
                </ul>
              )}
            </Block>
          </Stack>
        )}
      </AsyncContent>
    </Stack>
  );
}

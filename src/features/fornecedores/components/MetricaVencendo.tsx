import { strings } from '@/shared/strings';
import { AsyncContent, Metric, MetricSkeleton } from '@/shared/ui';
import { useVencimentos } from '../hooks/useVencimentos';

const t = strings.pages.visaoGeral.metricas;

export function MetricaVencendo() {
  const query = useVencimentos();
  return (
    <AsyncContent query={query} skeleton={<MetricSkeleton />} errorVariant="compact">
      {(v) => (
        <Metric
          tone="warn"
          label={t.vencendo}
          value={v.proximos.length}
          hint={t.vencendoHint(new Set(v.proximos.map((x) => x.fornecedor.id)).size)}
        />
      )}
    </AsyncContent>
  );
}

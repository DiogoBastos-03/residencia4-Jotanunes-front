import { strings } from '@/shared/strings';
import { AsyncContent, Metric, MetricSkeleton } from '@/shared/ui';
import { useAnalisesHoje } from '../hooks/useAnalisesHoje';

const t = strings.pages.visaoGeral.metricas;

export function MetricaAnalisesHoje() {
  const query = useAnalisesHoje();
  return (
    <AsyncContent query={query} skeleton={<MetricSkeleton />} errorVariant="compact">
      {(hoje) => (
        <Metric tone="review" label={t.analisados} value={hoje.total} hint={t.analisadosHint(hoje.aprovados, hoje.reprovados)} />
      )}
    </AsyncContent>
  );
}

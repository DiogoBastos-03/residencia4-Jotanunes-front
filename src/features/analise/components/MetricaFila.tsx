import { strings } from '@/shared/strings';
import { AsyncContent, Metric, MetricSkeleton } from '@/shared/ui';
import { useFila } from '../hooks/useFila';

const t = strings.pages.visaoGeral.metricas;

/** "Aguardando análise" — o mesmo número da fila e do menu. */
export function MetricaFila() {
  const query = useFila();
  return (
    <AsyncContent query={query} skeleton={<MetricSkeleton />} errorVariant="compact">
      {(fila) => <Metric tone="warn" label={t.aguardando} value={fila.contagem.todos} hint={t.aguardandoHint(fila.atrasadas)} />}
    </AsyncContent>
  );
}

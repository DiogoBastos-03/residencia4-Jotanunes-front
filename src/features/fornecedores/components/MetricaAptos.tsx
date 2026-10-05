import { strings } from '@/shared/strings';
import { AsyncContent, Metric, MetricSkeleton } from '@/shared/ui';
import { useFornecedores } from '../hooks/useFornecedores';

const t = strings.pages.visaoGeral.metricas;

export function MetricaAptos() {
  const query = useFornecedores();
  return (
    <AsyncContent query={query} skeleton={<MetricSkeleton />} errorVariant="compact">
      {(lista) => <Metric tone="ok" label={t.aptos} value={lista.porSituacao.apto} hint={t.aptosHint(lista.porSituacao.todos)} />}
    </AsyncContent>
  );
}

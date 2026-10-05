import { strings } from '@/shared/strings';
import { Metric, MetricStrip } from '@/shared/ui';
import type { DetalheRemessa } from '../types';

const t = strings.pages.remessa.metricas;

/** Resumo em 3 números, recalculado a cada decisão. */
export function RemessaResumo({ remessa }: { remessa: DetalheRemessa }) {
  return (
    <MetricStrip columns={3}>
      <Metric tone="ok" label={t.aprovados} value={remessa.aprovados} />
      <Metric tone="review" label={t.aguardando} value={remessa.aguardando} />
      <Metric tone="danger" label={t.reprovados} value={remessa.reprovados} />
    </MetricStrip>
  );
}

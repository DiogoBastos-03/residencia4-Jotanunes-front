import { strings } from '@/shared/strings';
import { Metric, MetricStrip } from '@/shared/ui';
import type { FichaObra } from '../types';

const t = strings.pages.obra.metricas;

export function ObraMetricas({ ficha }: { ficha: FichaObra }) {
  return (
    <MetricStrip columns={3}>
      <Metric label={t.listas} value={ficha.listas.length} />
      <Metric label={t.fornecedores} value={ficha.fornecedores.length} />
      <Metric label={t.pendencias} value={ficha.totalPendencias} />
    </MetricStrip>
  );
}

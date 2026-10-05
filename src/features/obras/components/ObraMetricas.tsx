import { strings } from '@/shared/strings';
import { Metric, MetricStrip } from '@/shared/ui';
import type { FichaObra } from '../types';

const t = strings.pages.obra.metricas;

export function ObraMetricas({ ficha }: { ficha: FichaObra }) {
  return (
    <MetricStrip>
      <Metric label={t.listas} value={ficha.listas.length} />
      <Metric label={t.fornecedores} value={ficha.fornecedores.length} />
      <Metric label={t.funcionarios} value={ficha.funcionariosEmCampo} />
      <Metric label={t.pendencias} value={ficha.totalPendencias} />
    </MetricStrip>
  );
}

import type { ResumoArquivos } from '@/entities';
import { strings } from '@/shared/strings';
import { Metric, MetricStrip } from '@/shared/ui';

const t = strings.pages.envio.metricas;

/** Os 3 números do envio, recalculados a cada decisão. */
export function EnvioResumo({ resumo }: { resumo: ResumoArquivos }) {
  return (
    <MetricStrip columns={3}>
      <Metric tone="ok" label={t.aprovados} value={resumo.aprovados} />
      <Metric tone="review" label={t.aguardando} value={resumo.emAnalise} />
      <Metric tone="danger" label={t.reprovados} value={resumo.reprovados} />
    </MetricStrip>
  );
}

import { FilaPrioritariaBlock, MetricaAnalisesHoje, MetricaFila, UltimasAnalisesBlock, useHoje } from '@/features/analise';
import { MetricaAptos, MetricaVencendo, VencimentosProximosBlock } from '@/features/fornecedores';
import { ObrasEmExecucao } from '@/features/obras';
import { formatDate, useDocumentTitle } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Grid, MetricStrip, PageHeader, Stack } from '@/shared/ui';

const t = strings.pages.visaoGeral;

export function VisaoGeralPage() {
  useDocumentTitle(t.title);
  const hoje = useHoje();
  return (
    <Stack>
      <PageHeader title={t.title} subtitle={t.subtitle(formatDate(hoje, 'long'))} />
      <MetricStrip>
        <MetricaFila />
        <MetricaAnalisesHoje />
        <MetricaAptos />
        <MetricaVencendo />
      </MetricStrip>
      <Grid>
        <FilaPrioritariaBlock />
        <VencimentosProximosBlock />
      </Grid>
      <UltimasAnalisesBlock />
      <ObrasEmExecucao />
    </Stack>
  );
}

import { strings } from '@/shared/strings';
import {
  Block,
  EmptyState,
  ErrorState,
  Grid,
  Heading,
  SkeletonBlock,
  SkeletonMetricStrip,
  SkeletonRegion,
  SkeletonTable,
  Stack,
  useToast,
} from '@/shared/ui';

const t = strings.pages.componentes.states;

export function StatesSection() {
  const { showToast } = useToast();
  return (
    <Block title={strings.pages.componentes.sections.states} padded>
      <Stack gap="lg">
        <Stack gap="sm">
          <Heading level={3}>{t.skeleton}</Heading>
          <SkeletonRegion>
            <Stack>
              <SkeletonMetricStrip />
              <Grid>
                <SkeletonBlock rows={3} />
                <SkeletonBlock rows={3} />
              </Grid>
              <SkeletonTable rows={3} columns={5} />
            </Stack>
          </SkeletonRegion>
        </Stack>
        <Grid>
          <Stack gap="sm">
            <Heading level={3}>{t.empty}</Heading>
            <EmptyState title={t.emptyTitle} description={t.emptyDescription} />
          </Stack>
          <Stack gap="sm">
            <Heading level={3}>{t.error}</Heading>
            <ErrorState onRetry={() => showToast(t.retried)} />
          </Stack>
        </Grid>
      </Stack>
    </Block>
  );
}

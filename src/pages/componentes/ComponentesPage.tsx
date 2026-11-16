import { strings } from '@/shared/strings';
import { Card, PageHeader, Stack } from '@/shared/ui';
import { ButtonsSection } from './ButtonsSection';
import { DataSection } from './DataSection';
import { FeedbackSection } from './FeedbackSection';
import { FiltersSection } from './FiltersSection';
import { FormsSection } from './FormsSection';
import { SelectSection } from './SelectSection';
import { OverlaysSection } from './OverlaysSection';
import { StatesSection } from './StatesSection';

const t = strings.pages.componentes;

/** Amostra de todos os componentes base. Só existe em desenvolvimento. */
export function ComponentesPage() {
  return (
    <main className="min-h-dvh p-3">
      <Card level="outer">
        <Stack>
          <PageHeader title={t.title} subtitle={t.subtitle} />
          <ButtonsSection />
          <FormsSection />
          <SelectSection />
          <FiltersSection />
          <DataSection />
          <OverlaysSection />
          <FeedbackSection />
          <StatesSection />
        </Stack>
      </Card>
    </main>
  );
}

import { strings } from '@/shared/strings';
import { AlertBox, Block, InfoNote, Stack } from '@/shared/ui';

const t = strings.pages.componentes.feedback;

export function FeedbackSection() {
  return (
    <Block title={strings.pages.componentes.sections.feedback} padded>
      <Stack>
        <InfoNote title={t.infoTitle}>{t.info}</InfoNote>
        <InfoNote>{t.infoPlain}</InfoNote>
        <AlertBox variant="error" title={t.errorTitle} withIcon>
          {t.error}
        </AlertBox>
        <AlertBox variant="warning" title={t.warningTitle} withIcon>
          {t.warning}
        </AlertBox>
      </Stack>
    </Block>
  );
}

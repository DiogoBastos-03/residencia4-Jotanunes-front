import { ClipboardDocumentListIcon, PlusIcon } from '@heroicons/react/24/outline';
import { ListasCards, useListas } from '@/features/exigencias';
import { paths, useDocumentTitle } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { AsyncContent, ButtonLink, EmptyState, PageHeader, SkeletonBlock, Stack, Text } from '@/shared/ui';

const t = strings.pages.exigencias;

export function ExigenciasPage() {
  useDocumentTitle(t.title);
  const query = useListas();
  const nova = (
    <ButtonLink to={paths.novaLista} variant="primary" icon={PlusIcon}>
      {t.nova}
    </ButtonLink>
  );
  return (
    <Stack>
      <PageHeader title={t.title} subtitle={t.subtitle} actions={nova} />
      <AsyncContent
        query={query}
        skeleton={
          <Stack>
            <SkeletonBlock rows={1} />
            <SkeletonBlock rows={1} />
            <SkeletonBlock rows={1} />
          </Stack>
        }
        isEmpty={(linhas) => linhas.length === 0}
        empty={<EmptyState icon={ClipboardDocumentListIcon} title={t.vazioTitle} description={t.vazioDescription} action={nova} />}
      >
        {(linhas) => (
          <Stack>
            <ListasCards linhas={linhas} />
            <Text size="support" tone="faint">
              {t.nota}
            </Text>
          </Stack>
        )}
      </AsyncContent>
    </Stack>
  );
}

import { ArrowsRightLeftIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline';
import { ObrasTabela, useObras } from '@/features/obras';
import { useDocumentTitle } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { AsyncContent, EmptyState, Icon, PageHeader, SkeletonTable, Stack, Text } from '@/shared/ui';

const t = strings.pages.obras;

export function ObrasPage() {
  useDocumentTitle(t.title);
  const query = useObras();
  return (
    <Stack>
      <PageHeader
        title={t.title}
        subtitle={t.subtitle}
        actions={
          <Text as="span" size="support" tone="faint" className="flex items-center gap-1.5 lg:mt-2">
            <Icon icon={ArrowsRightLeftIcon} size={16} />
            {t.origem}
          </Text>
        }
      />
      <AsyncContent
        query={query}
        skeleton={<SkeletonTable rows={10} columns={8} />}
        isEmpty={(linhas) => linhas.length === 0}
        empty={<EmptyState icon={BuildingOffice2Icon} title={t.vaziaTitle} description={t.vaziaDescription} />}
      >
        {(linhas) => <ObrasTabela linhas={linhas} />}
      </AsyncContent>
    </Stack>
  );
}

import { NovaListaForm, useObrasParaNovaLista } from '@/features/exigencias';
import { useDocumentTitle } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { AsyncContent, Skeleton, SkeletonBlock, Stack } from '@/shared/ui';

export function NovaListaPage() {
  useDocumentTitle(strings.pages.novaLista.title);
  const query = useObrasParaNovaLista();
  return (
    <AsyncContent
      query={query}
      skeleton={
        <Stack>
          <Skeleton className="h-8 w-80 max-w-full" />
          <SkeletonBlock rows={3} />
          <SkeletonBlock rows={4} />
        </Stack>
      }
    >
      {(obras) => <NovaListaForm obras={obras} />}
    </AsyncContent>
  );
}

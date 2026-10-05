import { formatDate, paths } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { AsyncContent, Badge, Block, ButtonLink, EmptyState, SkeletonBlock, Text } from '@/shared/ui';
import { useAnalisesHoje } from '../hooks/useAnalisesHoje';

const t = strings.pages.visaoGeral.analises;

export function UltimasAnalisesBlock() {
  const query = useAnalisesHoje();
  return (
    <AsyncContent query={query} skeleton={<SkeletonBlock rows={4} />}>
      {(hoje) => (
        <Block title={t.title}>
          {hoje.recentes.length === 0 ? (
            <EmptyState
              framed={false}
              title={t.emptyTitle}
              description={t.emptyDescription}
              action={
                <ButtonLink to={paths.fila} variant="secondary">
                  {t.emptyAction}
                </ButtonLink>
              }
            />
          ) : (
            <ul>
              {hoje.recentes.map((analise) => (
                <li
                  key={analise.id}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border px-4 py-2.75 last:border-b-0"
                >
                  <Text as="span" size="support" tone="faint" className="tabular w-11">
                    {formatDate(analise.quando, 'time')}
                  </Text>
                  <Text as="span" size="support" tone="soft" className="w-32.5 max-lg:flex-1">
                    {analise.analista}
                  </Text>
                  <Text as="span" className="min-w-0 flex-1 max-lg:order-last max-lg:basis-full">
                    {analise.documento}
                  </Text>
                  <Text as="span" size="support" tone="muted" className="w-57.5 max-lg:order-last max-lg:basis-full">
                    {analise.fornecedor.razaoSocial}
                  </Text>
                  <Badge status={analise.resultado} />
                </li>
              ))}
            </ul>
          )}
        </Block>
      )}
    </AsyncContent>
  );
}

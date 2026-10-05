import { ClockIcon } from '@heroicons/react/24/outline';
import { cn } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Badge, Block, EmptyState, Inline, Text } from '@/shared/ui';
import type { TempoDaLista } from '../types';

const t = strings.pages.relatorios.tempos;

/** Barra neutra (grafite); âmbar quando a lista passa da meta. */
export function TemposDeAnalise({ tempos }: { tempos: readonly TempoDaLista[] }) {
  const maximo = Math.max(1, ...tempos.map((x) => x.diasMedios));
  return (
    <Block title={t.title}>
      {tempos.length === 0 ? (
        <EmptyState framed={false} icon={ClockIcon} title={t.vazioTitle} description={t.vazioDescription} />
      ) : (
        <ul>
          {tempos.map((x) => (
            <li key={x.lista.id} className="border-b border-border px-4 py-3.5 last:border-b-0">
              <Inline justify="between">
                <Inline gap="sm">
                  <Text weight="medium">{x.lista.nome}</Text>
                  <Badge status={x.lista.tipo} />
                </Inline>
                <Text as="span" tone="muted" className="tabular">
                  {t.dias(x.diasMedios)}
                  {x.acimaDaMeta && (
                    <Text as="span" size="label" className="ml-2 text-warn">
                      {t.acimaDaMeta}
                    </Text>
                  )}
                </Text>
              </Inline>
              <span
                role="img"
                aria-label={t.dias(x.diasMedios)}
                className="mt-2.5 block h-1.5 overflow-hidden rounded-badge bg-surface-3"
              >
                <span
                  className={cn('block h-full rounded-badge', x.acimaDaMeta ? 'bg-warn' : 'bg-action')}
                  style={{ width: `${(x.diasMedios / maximo) * 100}%` }}
                />
              </span>
            </li>
          ))}
        </ul>
      )}
    </Block>
  );
}

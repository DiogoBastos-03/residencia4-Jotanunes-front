import { ChevronRightIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import { paths } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Block, BlockRowLink, EmptyState, Icon, Mono, Text } from '@/shared/ui';
import type { PendenciasDaObra } from '../types';

const t = strings.pages.relatorios.pendencias;

/** Uma linha por obra com pendência; a barra é proporcional à obra com mais pendências. */
export function PendenciasPorObra({ linhas }: { linhas: readonly PendenciasDaObra[] }) {
  const maximo = Math.max(1, ...linhas.map((l) => l.total));
  return (
    <Block title={t.title} description={t.description}>
      {linhas.length === 0 ? (
        <EmptyState framed={false} icon={CheckBadgeIcon} title={t.vazioTitle} description={t.vazioDescription} />
      ) : (
        <ul>
          {linhas.map((l) => (
            <li key={l.obra.id}>
              <BlockRowLink to={`${paths.obra(l.obra.id)}?aba=pendencias`} className="flex-wrap py-3.5 max-md:flex-wrap">
                <div className="min-w-0 flex-1">
                  <Text weight="medium">{l.obra.nome}</Text>
                  <Text size="support" tone="muted" className="mt-0.5">
                    <Mono>{l.obra.codigo}</Mono> {strings.common.separator} {t.linha(l.fornecedores)}
                  </Text>
                </div>
                <Text as="span" weight="semibold" className="tabular w-28 text-right">
                  {t.total(l.total)}
                </Text>
                <Icon icon={ChevronRightIcon} size={16} className="row-affordance" />
                <span className="block h-1.5 basis-full overflow-hidden rounded-badge bg-surface-3" aria-hidden="true">
                  <span className="block h-full rounded-badge bg-action" style={{ width: `${(l.total / maximo) * 100}%` }} />
                </span>
              </BlockRowLink>
            </li>
          ))}
        </ul>
      )}
    </Block>
  );
}

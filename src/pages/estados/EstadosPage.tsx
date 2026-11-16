import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { useMemo } from 'react';
import { datasetStore } from '@/mocks';
import { useDocumentTitle, useStore } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Block, BlockRowLink, Icon, Mono, PageHeader, Stack, Text } from '@/shared/ui';
import { montarCatalogo } from './catalogo';

const t = strings.pages.estados;

/** Lista de revisão: todo estado da aplicação, com link direto. */
export function EstadosPage() {
  useDocumentTitle(t.title);
  const ds = useStore(datasetStore);
  const catalogo = useMemo(() => montarCatalogo(ds), [ds]);
  const total = catalogo.reduce((n, g) => n + g.entradas.length, 0);
  return (
    <Stack>
      <PageHeader title={t.title} subtitle={t.subtitle(total)} />
      {catalogo.map((grupo) => (
        <Block key={grupo.chave} title={t.grupos[grupo.chave]}>
          <ul>
            {grupo.entradas.map((entrada) => {
              const [nome, descricao, caminho] = t.estados[entrada.chave];
              return (
                <li key={entrada.chave}>
                  <BlockRowLink to={entrada.para}>
                    <div className="min-w-0 flex-1">
                      <Text weight="medium">{nome}</Text>
                      <Text size="support" tone="muted" className="mt-0.5">
                        {descricao} {t.caminho} {caminho}
                      </Text>
                    </div>
                    <Mono className="max-w-80 truncate max-md:hidden">{entrada.para}</Mono>
                    <Icon icon={ChevronRightIcon} size={16} className="row-affordance" />
                  </BlockRowLink>
                </li>
              );
            })}
          </ul>
        </Block>
      ))}
    </Stack>
  );
}

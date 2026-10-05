import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { paths } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { AsyncContent, Badge, Block, BlockRowLink, ButtonLink, EmptyState, Icon, SkeletonBlock, Text } from '@/shared/ui';
import { useFila } from '../hooks/useFila';
import { nomeDaEntrada, rotaDaEntrada } from '../lib';

const t = strings.pages.visaoGeral.fila;
const LIMITE = 5;

/** Os 5 primeiros da fila: urgentes primeiro, depois quem espera há mais tempo. */
export function FilaPrioritariaBlock() {
  const query = useFila();
  return (
    <AsyncContent query={query} skeleton={<SkeletonBlock rows={LIMITE} />}>
      {(fila) => (
        <Block
          title={t.title}
          action={
            <ButtonLink to={paths.fila} variant="link" size="sm">
              {t.action}
            </ButtonLink>
          }
        >
          {fila.entradas.length === 0 ? (
            <EmptyState framed={false} title={t.emptyTitle} description={t.emptyDescription} />
          ) : (
            <ul>
              {fila.entradas.slice(0, LIMITE).map((entrada) => (
                <li key={entrada.id}>
                  <BlockRowLink to={rotaDaEntrada(entrada)}>
                    <div className="min-w-0 flex-1 max-md:basis-full">
                      <Text weight="medium">{nomeDaEntrada(entrada)}</Text>
                      <Text size="support" tone="muted" className="mt-0.5">
                        {entrada.fornecedor.razaoSocial} {strings.common.separator} {entrada.obraPrincipal.nome}
                      </Text>
                    </div>
                    <Text as="span" size="support" tone="muted" className="w-25 text-right max-md:w-auto max-md:text-left">
                      {strings.dominio.esperaCurta(entrada.esperaDias)}
                    </Text>
                    <Badge status={entrada.prioridade} />
                    <Icon icon={ChevronRightIcon} size={16} className="row-affordance max-md:ml-auto" />
                  </BlockRowLink>
                </li>
              ))}
            </ul>
          )}
        </Block>
      )}
    </AsyncContent>
  );
}

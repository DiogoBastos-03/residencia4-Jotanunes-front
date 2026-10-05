import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { paths } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { AsyncContent, Block, BlockRowLink, EmptyState, Icon, SkeletonBlock, Text } from '@/shared/ui';
import { useVencimentos } from '../hooks/useVencimentos';
import { DataBox } from './DataBox';

const t = strings.pages.visaoGeral.vencimentos;
const LIMITE = 5;
/** Até quantos dias o vencimento aparece em âmbar. */
export const ALERTA_VENCIMENTO_DIAS = 20;

export function VencimentosProximosBlock() {
  const query = useVencimentos();
  return (
    <AsyncContent query={query} skeleton={<SkeletonBlock rows={LIMITE} />}>
      {(v) => (
        <Block title={t.title}>
          {v.proximos.length === 0 ? (
            <EmptyState framed={false} title={t.emptyTitle} description={t.emptyDescription} />
          ) : (
            <ul>
              {v.proximos.slice(0, LIMITE).map((item) => (
                <li key={item.documentoId}>
                  <BlockRowLink to={paths.fornecedor(item.fornecedor.id)} className="py-2.5">
                    <DataBox data={item.validade} alerta={item.diasRestantes <= ALERTA_VENCIMENTO_DIAS} />
                    <div className="min-w-0 flex-1">
                      <Text weight="medium">{item.documentoNome}</Text>
                      <Text size="support" tone="muted" className="mt-0.5">
                        {item.fornecedor.razaoSocial}
                        {item.renovacaoEmAnalise && ` ${strings.common.separator} ${t.renovacao}`}
                      </Text>
                    </div>
                    <Icon icon={ChevronRightIcon} size={16} className="row-affordance" />
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

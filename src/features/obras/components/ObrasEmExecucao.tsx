import { paths } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { AsyncContent, Badge, Block, ButtonLink, CardLink, EmptyState, Mono, Skeleton, Text } from '@/shared/ui';
import { useObras } from '../hooks/useObras';

const t = strings.pages.visaoGeral.obras;

function Numero({ label, valor }: { label: string; valor: number }) {
  return (
    <div className="min-w-0">
      <dt className="text-label text-ink-3">{label}</dt>
      <dd className="tabular mt-0.5 text-block font-semibold">{valor}</dd>
    </div>
  );
}

function Esqueleto() {
  return (
    <div className="grid gap-3 rounded-control border border-border p-4 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-control border border-border p-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="mt-2 h-3 w-1/2" />
          <Skeleton className="mt-4 h-8 w-full" />
        </div>
      ))}
    </div>
  );
}

/** Cartões das obras em execução — cada um abre a ficha da obra. */
export function ObrasEmExecucao() {
  const query = useObras();
  return (
    <AsyncContent query={query} skeleton={<Esqueleto />}>
      {(linhas) => {
        const emExecucao = linhas.filter((l) => l.obra.situacao === 'emExecucao');
        return (
          <Block
            title={t.title}
            padded
            action={
              <ButtonLink to={paths.obras} variant="link" size="sm">
                {t.action}
              </ButtonLink>
            }
          >
            {emExecucao.length === 0 ? (
              <EmptyState framed={false} title={t.emptyTitle} description={t.emptyDescription} />
            ) : (
              <ul className="grid items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {emExecucao.map(({ obra, fornecedores, pendencias, listas }) => (
                  <li key={obra.id}>
                    <CardLink to={paths.obra(obra.id)}>
                      <div className="flex items-start justify-between gap-2">
                        <Text weight="semibold">{obra.nome}</Text>
                        {listas === 0 && <Badge status="semLista" />}
                      </div>
                      <Text size="support" tone="muted" className="mt-1">
                        {/* Obra da API não tem código nem cidade: a linha some. */}
                        {obra.codigo && <Mono>{obra.codigo}</Mono>}
                        {obra.codigo && obra.cidade && ` ${strings.common.separator} `}
                        {obra.cidade && strings.dominio.cidadeUf(obra.cidade, obra.uf)}
                      </Text>
                      <dl className="mt-auto grid grid-cols-3 gap-3 pt-4">
                        <Numero label={t.fornecedores} valor={fornecedores} />
                        <Numero label={t.listas} valor={listas} />
                        <Numero label={t.pendencias} valor={pendencias} />
                      </dl>
                    </CardLink>
                  </li>
                ))}
              </ul>
            )}
          </Block>
        );
      }}
    </AsyncContent>
  );
}

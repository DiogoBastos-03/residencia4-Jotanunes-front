import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { useParams } from 'react-router';
import { AnaliseEnvio, CabecalhoAnalise, useEnvioArquivos, useOrigem, useSequencia } from '@/features/analise';
import { formatDate, paths, useDocumentTitle } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { AsyncContent, Badge, ButtonLink, EmptyState, Skeleton, SkeletonMetricStrip, SkeletonTable, Stack } from '@/shared/ui';

const t = strings.pages.envio;

/** Envio de documento de funcionário: os arquivos, cada um com a sua decisão. */
export function EnvioPage() {
  const { id = '' } = useParams();
  const origem = useOrigem();
  const query = useEnvioArquivos(id);
  const sequencia = useSequencia(origem, id);
  useDocumentTitle(query.data?.exigido.nome ?? strings.pages.fila.title);

  return (
    <AsyncContent
      query={query}
      skeleton={
        <Stack>
          <Skeleton className="h-8 w-80 max-w-full" />
          <SkeletonMetricStrip columns={3} />
          <SkeletonTable rows={8} columns={4} />
        </Stack>
      }
      isEmpty={(d) => d === null}
      empty={
        <EmptyState
          icon={DocumentDuplicateIcon}
          title={t.naoEncontradoTitle}
          description={t.naoEncontradoDescription}
          action={<ButtonLink to={paths.origem(origem)}>{t.naoEncontradoAction}</ButtonLink>}
        />
      }
    >
      {(detalhe) =>
        detalhe && (
          <Stack>
            <CabecalhoAnalise
              origem={origem}
              sequencia={sequencia}
              title={t.title(detalhe.exigido.nome)}
              badges={
                <>
                  <Badge status="funcionarios" />
                  {detalhe.emAnalise && <Badge status="emAnalise" />}
                </>
              }
              subtitle={t.subtitle(detalhe.fornecedor.razaoSocial, detalhe.lista.nome, detalhe.arquivos.length, formatDate(detalhe.envio.enviadoEm, 'date'))}
            />
            <AnaliseEnvio key={detalhe.envio.id} detalhe={detalhe} origem={origem} />
          </Stack>
        )
      }
    </AsyncContent>
  );
}

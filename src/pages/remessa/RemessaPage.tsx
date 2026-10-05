import { UserGroupIcon } from '@heroicons/react/24/outline';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { RemessaResumo, RemessaRodape, RemessaTabela, useDecisoes, useRemessa } from '@/features/analise';
import { FuncionarioDrawer } from '@/features/funcionarios';
import { formatDate, paths, useDocumentTitle } from '@/shared/lib';
import { strings } from '@/shared/strings';
import {
  AsyncContent,
  ButtonLink,
  EmptyState,
  PageHeader,
  Skeleton,
  SkeletonMetricStrip,
  SkeletonTable,
  Stack,
  useToast,
} from '@/shared/ui';

const t = strings.pages.remessa;

export function RemessaPage() {
  const { id = '' } = useParams();
  const query = useRemessa(id);
  const navigate = useNavigate();
  const { concluirRemessa } = useDecisoes();
  const { showToast } = useToast();
  // A pessoa aberta fica na URL (?pessoa=), para o drawer abrir direto pela /_estados.
  const [params, setParams] = useSearchParams();
  const pessoa = params.get('pessoa');
  const abrirPessoa = (funcionarioId: string | null) =>
    setParams(
      (atual) => {
        const proximo = new URLSearchParams(atual);
        if (funcionarioId) proximo.set('pessoa', funcionarioId);
        else proximo.delete('pessoa');
        return proximo;
      },
      { replace: true },
    );
  useDocumentTitle(query.data ? strings.dominio.remessa(query.data.pessoas.length) : strings.pages.fila.title);

  return (
    <>
      <AsyncContent
        query={query}
        skeleton={
          <Stack>
            <Skeleton className="h-8 w-80 max-w-full" />
            <SkeletonMetricStrip columns={3} />
            <SkeletonTable rows={8} columns={5} />
          </Stack>
        }
        isEmpty={(r) => r === null}
        empty={
          <EmptyState
            icon={UserGroupIcon}
            title={t.naoEncontradaTitle}
            description={t.naoEncontradaDescription}
            action={<ButtonLink to={paths.fila}>{t.naoEncontradaAction}</ButtonLink>}
          />
        }
      >
        {(remessa) =>
          remessa && (
            <Stack>
              <PageHeader
                level="subpage"
                back={{ to: paths.fila, label: t.voltar, style: 'icon' }}
                title={strings.dominio.remessa(remessa.pessoas.length)}
                subtitle={t.subtitle(
                  remessa.entrada.fornecedor.razaoSocial,
                  remessa.entrada.obraPrincipal.nome,
                  remessa.item.nome,
                  remessa.entrada.lista.nome,
                  formatDate(remessa.entrada.enviadoEm, 'date'),
                )}
              />
              <RemessaResumo remessa={remessa} />
              <RemessaTabela pessoas={remessa.pessoas} onAbrir={abrirPessoa} />
              <RemessaRodape
                aguardando={remessa.aguardando}
                onConcluir={() => {
                  concluirRemessa(remessa.entrada.id);
                  navigate(paths.fila);
                  showToast(t.concluida);
                }}
              />
            </Stack>
          )
        }
      </AsyncContent>
      <FuncionarioDrawer funcionarioId={pessoa} onClose={() => abrirPessoa(null)} />
    </>
  );
}

import { useState } from 'react';
import { ClipboardDocumentListIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { useParams } from 'react-router';
import { useListaDetalhe, useVersoesLista } from '@/entities/exigencias';
import { useDefinicoesApi, useFormatosApi } from '@/entities/tipoDocumento';
import { DrawerEditarExigencias, ExigenciasTabela, ModalRenomearLista, VersoesLista } from '@/features/exigencias';
import { ApiError } from '@/shared/api';
import { formatDate, juntar, paths, useDocumentTitle, useResultado, type Consulta } from '@/shared/lib';
import { numeroVersao } from '@/shared/strings/pages/exigencias';
import { strings } from '@/shared/strings';
import { AsyncContent, Badge, Button, ButtonLink, EmptyState, PageHeader, Skeleton, SkeletonTable, Stack, Text } from '@/shared/ui';
import type { ListaDetalhe, VersaoLista } from '@/entities/exigencias';

const t = strings.pages.lista;

/**
 * Ficha da lista: GET /workflows/{id} (vigente) e GET /workflows/{id}/versions (histórico).
 * Renomear não cria versão; editar as exigências cria a próxima.
 */
export function ListaPage() {
  const { id = '' } = useParams();
  const listaId = Number(id);
  const detalhe = useListaDetalhe(listaId);
  const versoes = useVersoesLista(listaId);
  const definicoes = useDefinicoesApi();
  const formatos = useFormatosApi();
  const [renomeando, setRenomeando] = useState(false);
  const [editando, setEditando] = useState(false);

  const idInvalido = !Number.isInteger(listaId) || listaId <= 0;
  const naoExiste = idInvalido || (detalhe.error instanceof ApiError && detalhe.error.status === 404);
  const tudo = juntar(detalhe, versoes, (d, v): { lista: ListaDetalhe; versoes: VersaoLista[] } | null => ({ lista: d, versoes: v }));
  const consulta: Consulta<{ lista: ListaDetalhe; versoes: VersaoLista[] } | null> = naoExiste
    ? { data: null, error: null, isPending: false, refetch: detalhe.refetch }
    : tudo;
  const query = useResultado(consulta);
  useDocumentTitle(query.data?.lista.nome ?? strings.pages.exigencias.title);
  const defs = definicoes.data?.itens ?? [];

  return (
    <AsyncContent
      query={query}
      skeleton={
        <Stack>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-96 max-w-full" />
          <SkeletonTable rows={5} columns={5} />
        </Stack>
      }
      isEmpty={(r) => r === null}
      empty={
        <EmptyState
          icon={ClipboardDocumentListIcon}
          title={t.naoEncontradaTitle}
          description={t.naoEncontradaDescription}
          action={<ButtonLink to={paths.exigencias}>{t.naoEncontradaAction}</ButtonLink>}
        />
      }
    >
      {(r) => {
        if (!r) return null;
        const { lista } = r;
        const vigente = numeroVersao(lista.vigente.numero);
        return (
          <Stack>
            <PageHeader
              level="subpage"
              back={{ to: paths.exigencias, label: t.voltar }}
              title={lista.nome}
              badges={<Badge status={lista.tipo} />}
              subtitle={`${t.tipo(strings.status[lista.tipo])} • ${t.criada(formatDate(lista.criadaEm, 'date'))}`}
              actions={
                <>
                  <Button icon={PencilSquareIcon} onClick={() => setRenomeando(true)}>
                    {t.renomear}
                  </Button>
                  <Button variant="primary" icon={PencilSquareIcon} onClick={() => setEditando(true)}>
                    {t.editarExigencias}
                  </Button>
                </>
              }
            />
            <Text weight="medium">{t.vigente(vigente, formatDate(lista.vigente.criadaEm, 'dateTime'))}</Text>
            <ExigenciasTabela exigencias={lista.vigente.exigencias} definicoes={defs} formatos={formatos.data ?? []} caption={t.caption(vigente)} />
            <VersoesLista versoes={r.versoes} vigenteId={lista.vigente.id} definicoes={defs} />
            <ModalRenomearLista lista={lista} open={renomeando} onClose={() => setRenomeando(false)} />
            <DrawerEditarExigencias lista={lista} definicoes={defs} open={editando} onClose={() => setEditando(false)} />
          </Stack>
        );
      }}
    </AsyncContent>
  );
}

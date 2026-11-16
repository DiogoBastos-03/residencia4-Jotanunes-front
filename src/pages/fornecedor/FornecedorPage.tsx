import { BuildingStorefrontIcon, LockOpenIcon, NoSymbolIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { useParams } from 'react-router';
import {
  AbaDadosFornecedor,
  AbaObrasFornecedor,
  ModalBloquear,
  ModalEditarFornecedor,
  useDefinirBloqueio,
  useFornecedor,
  useParametrosFornecedor,
  type AbaFornecedor,
} from '@/features/fornecedores';
import { mensagemDoErro } from '@/shared/api';
import { formatCnpj, paths, useDocumentTitle } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { AsyncContent, Badge, BadgeGroup, Button, ButtonLink, EmptyState, Mono, PageHeader, Skeleton, SkeletonTable, Stack, Tabs, useToast } from '@/shared/ui';

const t = strings.pages.fornecedor;

/**
 * Abas da ficha: só o que a API fornece.
 *
 * Fora da interface até a API ter o endpoint (o código continua em src/features/fornecedores):
 * - Documentos (AbaDocumentos) — Fase 3, quando o acervo (GET /enterprises/{id}/archive) funcionar.
 * - Exigências (AbaExigenciasFornecedor) — quando houver endpoint de listas de exigências.
 * - Histórico (AbaHistoricoFornecedor) — quando houver endpoint de eventos/histórico.
 * - Contatos (AbaContatos, ModalEditarContato) e "Reenviar acesso" (ModalReenviarAcesso) —
 *   quando houver endpoint de contatos e de convite ao portal.
 * A ficha documental que alimentava essas abas está em hooks/useFichaDocumental.ts.
 */
const ABAS: ReadonlyArray<{ value: AbaFornecedor; label: string }> = [
  { value: 'dados', label: t.abas.dados },
  { value: 'obras', label: t.abas.obras },
];

export function FornecedorPage() {
  const { id = '' } = useParams();
  const query = useFornecedor(id);
  const p = useParametrosFornecedor();
  const bloqueio = useDefinirBloqueio();
  const { showToast } = useToast();
  useDocumentTitle(query.data?.cadastro.razaoSocial ?? strings.pages.fornecedores.title);

  async function desbloquear(fornecedorId: string) {
    try {
      await bloqueio.mutateAsync({ id: fornecedorId, bloqueado: false });
    } catch (e) {
      showToast(strings.modais.bloquear.erroDesbloquear(mensagemDoErro(e)), 'error');
      return;
    }
    showToast(strings.modais.bloquear.desbloqueadoToast);
  }

  return (
    <AsyncContent
      query={query}
      skeleton={
        <Stack>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-96 max-w-full" />
          <Skeleton className="h-10 w-full" />
          <SkeletonTable rows={6} columns={2} />
        </Stack>
      }
      isEmpty={(ficha) => ficha === null}
      empty={
        <EmptyState
          icon={BuildingStorefrontIcon}
          title={t.naoEncontradoTitle}
          description={t.naoEncontradoDescription}
          action={<ButtonLink to={paths.fornecedores}>{t.naoEncontradoAction}</ButtonLink>}
        />
      }
    >
      {(ficha) =>
        ficha && (
          <Stack>
            <PageHeader
              level="subpage"
              back={{ to: paths.fornecedores, label: t.voltar }}
              title={ficha.cadastro.razaoSocial}
              badges={
                <>
                  {ficha.cadastro.bloqueado && <Badge status="bloqueado" />}
                  <BadgeGroup statuses={ficha.cadastro.tipos} />
                </>
              }
              subtitle={<Mono>{formatCnpj(ficha.cadastro.cnpj)}</Mono>}
              actions={
                <>
                  <Button icon={PencilSquareIcon} onClick={() => p.setModal('editar')}>
                    {t.editar}
                  </Button>
                  {ficha.cadastro.bloqueado ? (
                    <Button
                      icon={LockOpenIcon}
                      disabled={bloqueio.isPending}
                      aria-busy={bloqueio.isPending}
                      onClick={() => void desbloquear(ficha.cadastro.id)}
                    >
                      {bloqueio.isPending ? strings.modais.bloquear.desbloqueando : t.desbloquear}
                    </Button>
                  ) : (
                    <Button icon={NoSymbolIcon} onClick={() => p.setModal('bloquear')}>
                      {t.bloquear}
                    </Button>
                  )}
                </>
              }
            />
            <Tabs label={t.abasLabel} items={ABAS} value={p.aba} onChange={p.setAba}>
              <div className="mt-4">
                {p.aba === 'dados' && <AbaDadosFornecedor ficha={ficha} />}
                {p.aba === 'obras' && <AbaObrasFornecedor ficha={ficha} />}
              </div>
            </Tabs>
            <ModalEditarFornecedor fornecedor={ficha.cadastro} open={p.modal === 'editar'} onClose={() => p.setModal(null)} />
            <ModalBloquear fornecedor={ficha.cadastro} open={p.modal === 'bloquear' && !ficha.cadastro.bloqueado} onClose={() => p.setModal(null)} />
          </Stack>
        )
      }
    </AsyncContent>
  );
}

import { useState } from 'react';
import { BuildingStorefrontIcon, EnvelopeIcon, LockOpenIcon, NoSymbolIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { useParams } from 'react-router';
import {
  AbaContatos,
  AbaDocumentos,
  AbaExigenciasFornecedor,
  AbaHistoricoFornecedor,
  AbaObrasFornecedor,
  errosDaApi,
  ModalBloquear,
  ModalEditarFornecedor,
  ModalReenviarAcesso,
  SituacaoFornecedor,
  useAcoesFornecedor,
  useFornecedor,
  useParametrosFornecedor,
  type AbaFornecedor,
} from '@/features/fornecedores';
import { formatCnpj, formatDate, formatPhone, paths, useDocumentTitle } from '@/shared/lib';
import { strings } from '@/shared/strings';
import {
  AsyncContent,
  BadgeGroup,
  Button,
  ButtonLink,
  EmptyState,
  Inline,
  Mono,
  PageHeader,
  Skeleton,
  SkeletonTable,
  Stack,
  Tabs,
  useToast,
} from '@/shared/ui';

const t = strings.pages.fornecedor;

const ABAS: ReadonlyArray<{ value: AbaFornecedor; label: string }> = [
  { value: 'documentos', label: t.abas.documentos },
  { value: 'exigencias', label: t.abas.exigencias },
  { value: 'obras', label: t.abas.obras },
  { value: 'historico', label: t.abas.historico },
  { value: 'contatos', label: t.abas.contatos },
];

export function FornecedorPage() {
  const { id = '' } = useParams();
  const query = useFornecedor(id);
  const p = useParametrosFornecedor();
  const { desbloquear } = useAcoesFornecedor();
  const { showToast } = useToast();
  const [desbloqueando, setDesbloqueando] = useState(false);

  async function confirmarDesbloqueio(id: string) {
    setDesbloqueando(true);
    try {
      await desbloquear(id);
      showToast(strings.modais.bloquear.desbloqueadoToast);
    } catch (erro) {
      // Sem formulário nem modal: o erro da API aparece no aviso.
      showToast(errosDaApi(erro).topo ?? strings.api.semResposta, 'error');
    } finally {
      setDesbloqueando(false);
    }
  }
  useDocumentTitle(query.data?.fornecedor.razaoSocial ?? strings.pages.fornecedores.title);

  return (
    <AsyncContent
      query={query}
      skeleton={
        <Stack>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-96 max-w-full" />
          <Skeleton className="h-10 w-full" />
          <SkeletonTable rows={6} columns={5} />
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
              title={ficha.fornecedor.razaoSocial}
              badges={
                <>
                  <SituacaoFornecedor situacao={ficha.resumo.situacao} aguardandoAcesso={ficha.aguardandoAcesso} />
                  <BadgeGroup statuses={ficha.fornecedor.tipos} />
                </>
              }
              subtitle={
                <Inline gap="xs">
                  <Mono>{formatCnpj(ficha.fornecedor.cnpj)}</Mono>
                  <span>{strings.common.separator}</span>
                  <span>{t.subtitle.desde(formatDate(ficha.fornecedor.desde, 'date'))}</span>
                  <span>{strings.common.separator}</span>
                  <span>{formatPhone(ficha.fornecedor.telefone)}</span>
                  <span>{strings.common.separator}</span>
                  <span className="break-all">{ficha.fornecedor.email}</span>
                </Inline>
              }
              actions={
                <>
                  <Button icon={PencilSquareIcon} onClick={() => p.setModal('editar')}>
                    {t.editar}
                  </Button>
                  {ficha.aguardandoAcesso && (
                    <Button icon={EnvelopeIcon} onClick={() => p.setModal('reenviar')}>
                      {t.reenviar}
                    </Button>
                  )}
                  {ficha.fornecedor.bloqueado ? (
                    <Button icon={LockOpenIcon} disabled={desbloqueando} aria-busy={desbloqueando} onClick={() => void confirmarDesbloqueio(ficha.fornecedor.id)}>
                      {desbloqueando ? strings.modais.bloquear.desbloqueando : t.desbloquear}
                    </Button>
                  ) : (
                    <Button icon={NoSymbolIcon} onClick={() => p.setModal('bloquear')}>
                      {t.bloquear}
                    </Button>
                  )}
                  <Button variant="primary" icon={EnvelopeIcon} onClick={() => showToast(t.cobrarToast(ficha.pendenciasParaCobrar))}>
                    {t.cobrar}
                  </Button>
                </>
              }
            />
            <Tabs label={t.abasLabel} items={ABAS} value={p.aba} onChange={p.setAba}>
              <div className="mt-4">
                {p.aba === 'documentos' && <AbaDocumentos ficha={ficha} />}
                {p.aba === 'exigencias' && <AbaExigenciasFornecedor ficha={ficha} />}
                {p.aba === 'obras' && <AbaObrasFornecedor ficha={ficha} />}
                {p.aba === 'historico' && <AbaHistoricoFornecedor ficha={ficha} />}
                {p.aba === 'contatos' && <AbaContatos ficha={ficha} onReenviar={() => p.setModal('reenviar')} />}
              </div>
            </Tabs>
            <ModalEditarFornecedor fornecedor={ficha.fornecedor} open={p.modal === 'editar'} onClose={() => p.setModal(null)} />
            <ModalBloquear fornecedor={ficha.fornecedor} open={p.modal === 'bloquear' && !ficha.fornecedor.bloqueado} onClose={() => p.setModal(null)} />
            <ModalReenviarAcesso fornecedor={p.modal === 'reenviar' && ficha.aguardandoAcesso ? ficha.fornecedor : null} onClose={() => p.setModal(null)} />
          </Stack>
        )
      }
    </AsyncContent>
  );
}

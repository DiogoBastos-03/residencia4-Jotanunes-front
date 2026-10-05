import { ArrowsRightLeftIcon, BuildingOffice2Icon, PlusIcon } from '@heroicons/react/24/outline';
import { useParams } from 'react-router';
import {
  AbaExigencias,
  AbaFornecedores,
  AbaHistorico,
  AbaPendencias,
  DrawerVincularFornecedor,
  DrawerVincularLista,
  ModalDesvincularLista,
  ObraMetricas,
  useObra,
  useParametrosObra,
  type AbaObra,
} from '@/features/obras';
import { formatDate, paths, useDocumentTitle, USAR_API } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { AsyncContent, Badge, Button, ButtonLink, EmptyState, Icon, InfoNote, Inline, Mono, PageHeader, Stack, Tabs } from '@/shared/ui';
import { ObraSkeleton } from './ObraSkeleton';

const t = strings.pages.obra;

/** Não há endpoint para criar vínculo obra ↔ fornecedor: com a API, só leitura. */
const PODE_VINCULAR_FORNECEDOR = !USAR_API;

const ABAS: ReadonlyArray<{ value: AbaObra; label: string }> = [
  { value: 'fornecedores', label: t.abas.fornecedores },
  { value: 'exigencias', label: t.abas.exigencias },
  { value: 'pendencias', label: t.abas.pendencias },
  { value: 'historico', label: t.abas.historico },
];

export function ObraPage() {
  const { id = '' } = useParams();
  const query = useObra(id);
  const p = useParametrosObra();
  useDocumentTitle(query.data?.obra.nome ?? strings.pages.obras.title);

  return (
    <AsyncContent
      query={query}
      skeleton={<ObraSkeleton />}
      isEmpty={(ficha) => ficha === null}
      empty={
        <EmptyState
          icon={BuildingOffice2Icon}
          title={t.naoEncontradaTitle}
          description={t.naoEncontradaDescription}
          action={<ButtonLink to={paths.obras}>{t.naoEncontradaAction}</ButtonLink>}
        />
      }
    >
      {(ficha) =>
        ficha && (
          <Stack>
            <PageHeader
              level="subpage"
              back={{ to: paths.obras, label: t.voltar }}
              title={ficha.obra.nome}
              badges={
                <>
                  <Badge status={ficha.obra.situacao} />
                  {ficha.listas.length === 0 && <Badge status="semLista" />}
                </>
              }
              subtitle={
                // Obra da API só tem nome: o que não existe não aparece.
                (ficha.obra.codigo || ficha.obra.cidade || ficha.obra.recebidaEm) && (
                  <Inline gap="xs">
                    {ficha.obra.codigo && <Mono>{ficha.obra.codigo}</Mono>}
                    {ficha.obra.codigo && ficha.obra.cidade && <span>{strings.common.separator}</span>}
                    {ficha.obra.cidade && <span>{strings.dominio.cidadeUf(ficha.obra.cidade, ficha.obra.uf)}</span>}
                    {ficha.obra.recebidaEm && (
                      <>
                        <span>{strings.common.separator}</span>
                        <Icon icon={ArrowsRightLeftIcon} size={16} />
                        <span>{t.recebida(formatDate(ficha.obra.recebidaEm, 'date'))}</span>
                      </>
                    )}
                  </Inline>
                )
              }
              actions={
                <Button variant="primary" icon={PlusIcon} disabled={!PODE_VINCULAR_FORNECEDOR} onClick={() => p.abrirDrawer('fornecedor')}>
                  {t.vincularFornecedor}
                </Button>
              }
            />
            {!PODE_VINCULAR_FORNECEDOR && <InfoNote>{t.vinculoIndisponivel}</InfoNote>}
            <ObraMetricas ficha={ficha} />
            <Tabs label={t.abasLabel} items={ABAS} value={p.aba} onChange={p.setAba}>
              <div className="mt-4">
                {p.aba === 'fornecedores' && <AbaFornecedores ficha={ficha} onVincular={PODE_VINCULAR_FORNECEDOR ? () => p.abrirDrawer('fornecedor') : undefined} />}
                {p.aba === 'exigencias' && (
                  <AbaExigencias ficha={ficha} onVincular={() => p.abrirDrawer('lista')} onDesvincular={p.setDesvincular} />
                )}
                {p.aba === 'pendencias' && <AbaPendencias ficha={ficha} />}
                {p.aba === 'historico' && <AbaHistorico ficha={ficha} />}
              </div>
            </Tabs>
            <DrawerVincularFornecedor
              ficha={ficha}
              open={PODE_VINCULAR_FORNECEDOR && p.drawer === 'fornecedor'}
              vazio={p.formVazio}
              onClose={() => p.abrirDrawer(null)}
              onVinculado={() => p.concluirDrawer('fornecedores')}
            />
            <DrawerVincularLista
              ficha={ficha}
              open={p.drawer === 'lista'}
              vazio={p.formVazio}
              onClose={() => p.abrirDrawer(null)}
              onVinculado={() => p.concluirDrawer('exigencias')}
            />
            <ModalDesvincularLista ficha={ficha} listaId={p.desvincular} onClose={() => p.setDesvincular(null)} />
          </Stack>
        )
      }
    </AsyncContent>
  );
}

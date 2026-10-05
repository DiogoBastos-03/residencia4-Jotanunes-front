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
import { formatDate, paths, useDocumentTitle } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { AsyncContent, Badge, Button, ButtonLink, EmptyState, Icon, Inline, Mono, PageHeader, Stack, Tabs } from '@/shared/ui';
import { ObraSkeleton } from './ObraSkeleton';

const t = strings.pages.obra;

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
                <Inline gap="xs">
                  <Mono>{ficha.obra.codigo}</Mono>
                  <span>{strings.common.separator}</span>
                  <span>{strings.dominio.cidadeUf(ficha.obra.cidade, ficha.obra.uf)}</span>
                  <span>{strings.common.separator}</span>
                  <Icon icon={ArrowsRightLeftIcon} size={16} />
                  <span>{t.recebida(formatDate(ficha.obra.recebidaEm, 'date'))}</span>
                </Inline>
              }
              actions={
                <Button variant="primary" icon={PlusIcon} onClick={() => p.abrirDrawer('fornecedor')}>
                  {t.vincularFornecedor}
                </Button>
              }
            />
            <ObraMetricas ficha={ficha} />
            <Tabs label={t.abasLabel} items={ABAS} value={p.aba} onChange={p.setAba}>
              <div className="mt-4">
                {p.aba === 'fornecedores' && <AbaFornecedores ficha={ficha} onVincular={() => p.abrirDrawer('fornecedor')} />}
                {p.aba === 'exigencias' && (
                  <AbaExigencias ficha={ficha} onVincular={() => p.abrirDrawer('lista')} onDesvincular={p.setDesvincular} />
                )}
                {p.aba === 'pendencias' && <AbaPendencias ficha={ficha} />}
                {p.aba === 'historico' && <AbaHistorico ficha={ficha} />}
              </div>
            </Tabs>
            <DrawerVincularFornecedor
              ficha={ficha}
              open={p.drawer === 'fornecedor'}
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

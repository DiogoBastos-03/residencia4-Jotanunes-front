import { useState } from 'react';
import { BuildingOffice2Icon, PlusIcon } from '@heroicons/react/24/outline';
import { useParams } from 'react-router';
import { useFornecedoresApi } from '@/entities/fornecedor';
import { FornecedoresDaObra, ListasDaObra, ModalDesvincular, ModalVincular, useObra, type AlvoDesvinculo } from '@/features/obras';
import { paths, useDocumentTitle } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { AsyncContent, Button, ButtonLink, EmptyState, PageHeader, Stack } from '@/shared/ui';
import { ObraSkeleton } from './ObraSkeleton';

const t = strings.pages.obra;

/** Ficha da obra: o nome e os fornecedores vinculados, com vincular e desvincular — tudo o que a API tem da obra. */
export function ObraPage() {
  const { id = '' } = useParams();
  const query = useObra(id);
  const todos = useFornecedoresApi();
  const [vinculando, setVinculando] = useState(false);
  const [desvinculando, setDesvinculando] = useState<AlvoDesvinculo | null>(null);
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
      {(ficha) => {
        if (!ficha) return null;
        const naObra = new Set(ficha.fornecedores.map((f) => f.id));
        // O back recusa empresa inativa (ENTERPRISE_INACTIVE) e repetida (409): só oferece as ativas que ainda não estão aqui.
        const opcoes = (todos.data?.itens ?? []).filter((f) => !f.bloqueado && !naObra.has(f.id)).map((f) => ({ id: f.id, nome: f.razaoSocial }));
        return (
          <Stack>
            <PageHeader
              level="subpage"
              back={{ to: paths.obras, label: t.voltar }}
              title={ficha.obra.nome}
              actions={
                <Button variant="primary" icon={PlusIcon} onClick={() => setVinculando(true)}>
                  {t.vincular}
                </Button>
              }
            />
            <ListasDaObra obraId={ficha.obra.id} nomeObra={ficha.obra.nome} />
            <FornecedoresDaObra
              fornecedores={ficha.fornecedores}
              onDesvincular={(f) => setDesvinculando({ obraId: ficha.obra.id, nomeObra: ficha.obra.nome, fornecedorId: f.id, razaoSocial: f.razaoSocial })}
            />
            <ModalVincular lado={{ de: 'obra', obraId: ficha.obra.id, nomeObra: ficha.obra.nome }} opcoes={opcoes} open={vinculando} onClose={() => setVinculando(false)} />
            <ModalDesvincular alvo={desvinculando} onClose={() => setDesvinculando(null)} />
          </Stack>
        );
      }}
    </AsyncContent>
  );
}

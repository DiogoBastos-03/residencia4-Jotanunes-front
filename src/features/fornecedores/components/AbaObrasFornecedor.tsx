import { useState } from 'react';
import { BuildingOffice2Icon, PlusIcon } from '@heroicons/react/24/outline';
import type { ObraResumo } from '@/entities';
import { useObrasApi } from '@/entities/obra';
import { ModalDesvincular, ModalVincular, type AlvoDesvinculo } from '@/features/obras';
import { paths } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Button, EmptyState, Inline, Stack, Table, type TableColumn } from '@/shared/ui';
import type { FichaCadastral } from '../types';

const t = strings.pages.fornecedor.obras;

const COLUNAS: readonly TableColumn<ObraResumo>[] = [{ key: 'obra', header: t.colunas.obra, tone: 'strong', mobile: 'title', cell: (o) => o.nome }];

/**
 * Obras do fornecedor, como a API devolve (só o nome), com vincular e desvincular.
 * Fornecedor bloqueado não tem "Vincular": o back recusa empresa inativa (ENTERPRISE_INACTIVE).
 */
export function AbaObrasFornecedor({ ficha }: { ficha: FichaCadastral }) {
  const todas = useObrasApi();
  const [vinculando, setVinculando] = useState(false);
  const [desvinculando, setDesvinculando] = useState<AlvoDesvinculo | null>(null);
  const { cadastro } = ficha;
  const ja = new Set(ficha.obras.map((o) => o.id));
  const opcoes = (todas.data?.itens ?? []).filter((o) => !ja.has(o.id)).map((o) => ({ id: o.id, nome: o.nome }));
  const podeVincular = !cadastro.bloqueado;

  return (
    <Stack>
      {podeVincular && ficha.obras.length > 0 && (
        <Inline justify="end">
          <Button icon={PlusIcon} onClick={() => setVinculando(true)}>
            {t.vincular}
          </Button>
        </Inline>
      )}
      {ficha.obras.length === 0 ? (
        <EmptyState
          icon={BuildingOffice2Icon}
          title={t.vazioTitle}
          description={podeVincular ? t.vazioDescription : t.vazioBloqueado}
          action={
            podeVincular && (
              <Button variant="primary" icon={PlusIcon} onClick={() => setVinculando(true)}>
                {t.vincular}
              </Button>
            )
          }
        />
      ) : (
        <Table
          caption={t.caption}
          columns={COLUNAS}
          rows={ficha.obras}
          rowKey={(o) => o.id}
          rowTo={(o) => paths.obra(o.id)}
          action={{
            label: () => t.desvincular,
            describe: (o) => o.nome,
            onClick: (o) => setDesvinculando({ obraId: o.id, nomeObra: o.nome, fornecedorId: cadastro.id, razaoSocial: cadastro.razaoSocial }),
          }}
        />
      )}
      <ModalVincular
        lado={{ de: 'fornecedor', fornecedorId: cadastro.id, razaoSocial: cadastro.razaoSocial }}
        opcoes={opcoes}
        open={vinculando}
        onClose={() => setVinculando(false)}
      />
      <ModalDesvincular alvo={desvinculando} onClose={() => setDesvinculando(null)} />
    </Stack>
  );
}

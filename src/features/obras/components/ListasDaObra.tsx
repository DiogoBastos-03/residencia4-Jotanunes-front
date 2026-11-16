import { useState } from 'react';
import { ClipboardDocumentListIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useListasApi, useListasDaObra, type ListaDaObra } from '@/entities/exigencias';
import { ModalVincularLista } from '@/features/exigencias';
import { paths } from '@/shared/lib';
import { numeroVersao } from '@/shared/strings/pages/exigencias';
import { strings } from '@/shared/strings';
import { AsyncContent, Badge, Block, Button, EmptyState, Mono, SkeletonTable, Table, type TableColumn } from '@/shared/ui';
import { useResultado } from '@/shared/lib';

const t = strings.pages.obra.listas;

const COLUNAS: readonly TableColumn<ListaDaObra>[] = [
  { key: 'nome', header: t.colunas.lista, tone: 'strong', mobile: 'title', cell: (l) => l.nome },
  { key: 'tipo', header: t.colunas.tipo, mobile: 'badge', cell: (l) => <Badge status={l.tipo} /> },
  { key: 'versao', header: t.colunas.versao, nowrap: true, cell: (l) => <Mono>{t.versao(numeroVersao(l.versao))}</Mono> },
];

/**
 * Listas de exigências em uso na obra (GET /workflow/constructions/{obraId}/workflows), na versão
 * que a obra segue. "Vincular lista" só aparece se há lista que o back aceitaria: que a obra ainda
 * não usa e de um tipo que ela ainda não tem (no máximo uma de material e uma de serviço).
 */
export function ListasDaObra({ obraId, nomeObra }: { obraId: string; nomeObra: string }) {
  const daObra = useListasDaObra(obraId);
  const todas = useListasApi();
  const query = useResultado(daObra);
  const [vinculando, setVinculando] = useState(false);

  const usadas = daObra.data ?? [];
  const opcoes = (todas.data?.itens ?? []).filter((l) => !usadas.some((u) => u.id === l.id || u.tipo === l.tipo));
  const podeVincular = daObra.data !== undefined && opcoes.length > 0;

  return (
    <Block
      title={t.title}
      description={t.descricao}
      action={
        podeVincular && (
          <Button size="sm" icon={PlusIcon} onClick={() => setVinculando(true)}>
            {t.vincular}
          </Button>
        )
      }
    >
      <AsyncContent query={query} skeleton={<SkeletonTable rows={2} columns={3} />} errorVariant="compact">
        {(listas) =>
          listas.length === 0 ? (
            <EmptyState icon={ClipboardDocumentListIcon} title={t.vazioTitle} description={t.vazioDescription} framed={false} />
          ) : (
            <Table
              caption={t.title}
              columns={COLUNAS}
              rows={listas}
              rowKey={(l) => String(l.id)}
              rowTo={(l) => paths.lista(l.id)}
              action={{ label: () => t.abrir, describe: (l) => l.nome, to: (l) => paths.lista(l.id) }}
            />
          )
        }
      </AsyncContent>
      <ModalVincularLista obraId={obraId} nomeObra={nomeObra} opcoes={opcoes} open={vinculando} onClose={() => setVinculando(false)} />
    </Block>
  );
}

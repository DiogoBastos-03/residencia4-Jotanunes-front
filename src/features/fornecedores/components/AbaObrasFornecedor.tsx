import { BuildingOffice2Icon } from '@heroicons/react/24/outline';
import { paths } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { ButtonLink, EmptyState, Table, type TableColumn } from '@/shared/ui';
import type { ObraResumo } from '@/entities';
import type { FichaCadastral } from '../types';

const t = strings.pages.fornecedor.obras;

const COLUNAS: readonly TableColumn<ObraResumo>[] = [{ key: 'obra', header: t.colunas.obra, tone: 'strong', mobile: 'title', cell: (o) => o.nome }];

/** Obras do fornecedor, como a API devolve: só o nome. */
export function AbaObrasFornecedor({ ficha }: { ficha: FichaCadastral }) {
  if (ficha.obras.length === 0) {
    return (
      <EmptyState
        icon={BuildingOffice2Icon}
        title={t.vazioTitle}
        description={t.vazioDescription}
        action={<ButtonLink to={paths.obras}>{t.verObras}</ButtonLink>}
      />
    );
  }
  return (
    <Table
      caption={t.caption}
      columns={COLUNAS}
      rows={ficha.obras}
      rowKey={(o) => o.id}
      rowTo={(o) => paths.obra(o.id)}
      action={{ label: () => t.abrir, describe: (o) => o.nome, to: (o) => paths.obra(o.id) }}
    />
  );
}

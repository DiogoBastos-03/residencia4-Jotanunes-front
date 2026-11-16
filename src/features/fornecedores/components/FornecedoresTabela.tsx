import { formatCnpj, paths } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Badge, BadgeGroup, Mono, Table, type TableColumn } from '@/shared/ui';
import type { LinhaFornecedor } from '../types';

const t = strings.pages.fornecedores;

const COLUNAS: readonly TableColumn<LinhaFornecedor>[] = [
  { key: 'nome', header: t.colunas.fornecedor, tone: 'strong', mobile: 'title', cell: (l) => l.fornecedor.razaoSocial },
  { key: 'cnpj', header: t.colunas.cnpj, nowrap: true, cell: (l) => <Mono>{formatCnpj(l.fornecedor.cnpj)}</Mono> },
  { key: 'tipo', header: t.colunas.tipo, cell: (l) => <BadgeGroup statuses={l.fornecedor.tipos} /> },
  { key: 'obras', header: t.colunas.obras, nowrap: true, cell: (l) => t.obras(l.obras) },
  {
    key: 'situacao',
    header: t.colunas.situacao,
    mobile: 'badge',
    cell: (l) => (l.fornecedor.bloqueado ? <Badge status="bloqueado" /> : null),
  },
];

/** Tudo nesta tabela vem da API: listagem de empresas e o filtro por obra. A linha abre a ficha. */
export function FornecedoresTabela({ linhas }: { linhas: readonly LinhaFornecedor[] }) {
  return (
    <Table
      caption={t.caption}
      columns={COLUNAS}
      rows={linhas}
      rowKey={(l) => l.fornecedor.id}
      rowTo={(l) => paths.fornecedor(l.fornecedor.id)}
      action={{ label: () => t.abrir, describe: (l) => l.fornecedor.razaoSocial, to: (l) => paths.fornecedor(l.fornecedor.id) }}
    />
  );
}

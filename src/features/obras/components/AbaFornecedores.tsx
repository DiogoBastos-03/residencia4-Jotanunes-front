import { PlusIcon, UsersIcon } from '@heroicons/react/24/outline';
import { formatDate, paths } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Badge, Button, EmptyState, InfoNote, Mono, Stack, Table, type TableColumn } from '@/shared/ui';
import type { FichaObra, FornecedorNaObra } from '../types';

const t = strings.pages.obra.fornecedores;

const COLUNAS: readonly TableColumn<FornecedorNaObra>[] = [
  { key: 'nome', header: t.colunas.fornecedor, tone: 'strong', mobile: 'title', cell: (f) => f.fornecedor.razaoSocial },
  { key: 'tipo', header: t.colunas.tipo, cell: (f) => <Badge status={f.fornecedor.tipo} /> },
  { key: 'servico', header: t.colunas.servico, cell: (f) => f.vinculo.servicoContratado },
  {
    key: 'periodo',
    header: t.colunas.periodo,
    nowrap: true,
    cell: (f) => <Mono>{t.periodo(formatDate(f.vinculo.inicio, 'monthYear'), formatDate(f.vinculo.fim, 'monthYear'))}</Mono>,
  },
  { key: 'listas', header: t.colunas.listas, cell: (f) => strings.dominio.documentosDe(f.listasAplicaveis, f.listasNaObra) },
  {
    key: 'docs',
    header: t.colunas.documentos,
    cell: (f) => strings.dominio.documentosDe(f.resumo.obrigatoriosEmDia, f.resumo.obrigatoriosTotal),
  },
  { key: 'situacao', header: t.colunas.situacao, mobile: 'badge', cell: (f) => <Badge status={f.resumo.situacao} /> },
];

export function AbaFornecedores({ ficha, onVincular }: { ficha: FichaObra; onVincular: () => void }) {
  if (ficha.fornecedores.length === 0) {
    return (
      <EmptyState
        icon={UsersIcon}
        title={t.vazioTitle}
        description={t.vazioDescription}
        action={
          <Button variant="primary" icon={PlusIcon} onClick={onVincular}>
            {strings.pages.obra.vincularFornecedor}
          </Button>
        }
      />
    );
  }
  return (
    <Stack>
      <Table
        caption={t.caption}
        columns={COLUNAS}
        rows={ficha.fornecedores}
        rowKey={(f) => f.fornecedor.id}
        action={{ label: () => t.acao, describe: (f) => f.fornecedor.razaoSocial, to: (f) => paths.fornecedor(f.fornecedor.id) }}
      />
      <InfoNote>{t.nota}</InfoNote>
    </Stack>
  );
}

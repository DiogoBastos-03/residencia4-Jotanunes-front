import type { EntradaFila } from '@/entities';
import { formatDate } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Badge, Mono, Table, Text, type TableColumn } from '@/shared/ui';
import { nomeDaEntrada, rotaDaEntrada } from '../lib';

const t = strings.pages.fila;

const COLUNAS: readonly TableColumn<EntradaFila>[] = [
  { key: 'fornecedor', header: t.colunas.fornecedor, cell: (e) => e.fornecedor.razaoSocial, tone: 'strong' },
  {
    key: 'item',
    header: t.colunas.item,
    mobile: 'title',
    tone: 'soft',
    cell: (e) => (
      <>
        {nomeDaEntrada(e)}
        {e.kind === 'documento' && e.renovacao && (
          <Text as="span" size="label" tone="muted">
            {' '}
            {strings.common.separator} {t.renovacao}
          </Text>
        )}
        {e.kind === 'envio' && (
          <Text as="span" size="label" tone="muted">
            {' '}
            {strings.common.separator} {t.arquivos(e.arquivos)}
          </Text>
        )}
      </>
    ),
  },
  {
    key: 'obra',
    header: t.colunas.obra,
    tone: 'soft',
    cell: (e) => (
      <>
        {e.obraPrincipal.nome}{' '}
        <Text as="span" tone="faint">
          {strings.dominio.obrasExtras(e.obrasExtras)}
        </Text>
      </>
    ),
  },
  { key: 'lista', header: t.colunas.lista, cell: (e) => <Text as="span" size="support" tone="muted">{e.lista.nome}</Text> },
  { key: 'enviado', header: t.colunas.enviadoEm, nowrap: true, cell: (e) => <Mono>{formatDate(e.enviadoEm, 'date')}</Mono> },
  { key: 'espera', header: t.colunas.espera, nowrap: true, cell: (e) => strings.dominio.espera(e.esperaDias) },
  { key: 'prioridade', header: t.colunas.prioridade, mobile: 'badge', cell: (e) => <Badge status={e.prioridade} /> },
];

export function FilaTabela({ entradas }: { entradas: readonly EntradaFila[] }) {
  return (
    <Table
      caption={t.caption}
      columns={COLUNAS}
      rows={entradas}
      rowKey={(e) => e.id}
      action={{ label: () => t.acao, describe: (e) => `${nomeDaEntrada(e)}, ${e.fornecedor.razaoSocial}`, to: (e) => rotaDaEntrada(e) }}
    />
  );
}

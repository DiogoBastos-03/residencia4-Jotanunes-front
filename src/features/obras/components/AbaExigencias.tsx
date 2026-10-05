import { ClipboardDocumentListIcon, PlusIcon } from '@heroicons/react/24/outline';
import { formatDate } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Badge, Button, EmptyState, InfoNote, Inline, Mono, Stack, Table, Text, type TableColumn } from '@/shared/ui';
import type { FichaObra, ListaNaObra } from '../types';

const t = strings.pages.obra.exigencias;

const COLUNAS: readonly TableColumn<ListaNaObra>[] = [
  { key: 'nome', header: t.colunas.lista, tone: 'strong', mobile: 'title', cell: (l) => l.lista.nome },
  { key: 'tipo', header: t.colunas.tipo, cell: (l) => <Badge status={l.lista.tipo} /> },
  {
    key: 'itens',
    header: t.colunas.itens,
    cell: (l) => strings.dominio.composicao(l.composicao.documentosObrigatorios, l.composicao.documentosOpcionais, l.composicao.itensFuncionarios),
  },
  { key: 'aplica', header: t.colunas.aplica, cell: (l) => t.aplica(l.aplicaA, l.fornecedoresNaObra) },
  { key: 'vinculada', header: t.colunas.vinculada, nowrap: true, cell: (l) => <Mono>{formatDate(l.vinculadaEm, 'date')}</Mono> },
];

type AbaExigenciasProps = {
  ficha: FichaObra;
  onVincular: () => void;
  onDesvincular: (listaId: string) => void;
};

export function AbaExigencias({ ficha, onVincular, onDesvincular }: AbaExigenciasProps) {
  const botao = (
    <Button variant="primary" icon={PlusIcon} onClick={onVincular} disabled={ficha.listasDisponiveis.length === 0}>
      {t.vincular}
    </Button>
  );
  if (ficha.listas.length === 0) {
    return <EmptyState icon={ClipboardDocumentListIcon} title={t.vazioTitle} description={t.vazioDescription} action={botao} />;
  }
  const ultima = ficha.listas.length === 1;
  const servico = ficha.listas.filter((l) => l.lista.tipo === 'servico').length;
  return (
    <Stack>
      <Inline justify="between">
        <Text size="support" tone="muted">
          {t.resumo(ficha.listas.length, servico, ficha.listas.length - servico)}
        </Text>
        {botao}
      </Inline>
      <Table
        caption={t.caption}
        columns={COLUNAS}
        rows={ficha.listas}
        rowKey={(l) => l.lista.id}
        action={{
          label: () => t.desvincular,
          describe: (l) => l.lista.nome,
          onClick: (l) => onDesvincular(l.lista.id),
          disabled: () => ultima,
        }}
      />
      <InfoNote>{ultima ? `${t.ultimaNota} ${t.nota}` : t.nota}</InfoNote>
    </Stack>
  );
}

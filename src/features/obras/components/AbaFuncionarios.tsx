import { UserGroupIcon } from '@heroicons/react/24/outline';
import { strings } from '@/shared/strings';
import { Badge, EmptyState, Stack, Table, Text, type TableColumn } from '@/shared/ui';
import type { FichaObra, PessoaNaObra } from '../types';

const t = strings.pages.obra.funcionarios;

export function AbaFuncionarios({ ficha, onAbrirPessoa }: { ficha: FichaObra; onAbrirPessoa: (id: string) => void }) {
  const remessa = ficha.remessaRecente;
  if (!remessa) {
    return (
      <EmptyState
        icon={UserGroupIcon}
        title={t.vazioTitle}
        description={ficha.temItemFuncionarios ? t.vazioDescription : t.semItemDescription}
      />
    );
  }
  const colunas: readonly TableColumn<PessoaNaObra>[] = [
    { key: 'nome', header: t.colunas.funcionario, tone: 'strong', mobile: 'title', cell: (p) => p.funcionario.nome },
    { key: 'fornecedor', header: t.colunas.fornecedor, cell: () => remessa.fornecedor.razaoSocial },
    { key: 'funcao', header: t.colunas.funcao, cell: (p) => p.funcionario.funcao },
    { key: 'docs', header: t.colunas.documentos, cell: (p) => strings.dominio.documentosDe(p.enviados, p.exigidos) },
    { key: 'situacao', header: t.colunas.situacao, mobile: 'badge', cell: (p) => <Badge status={p.funcionario.status} /> },
  ];
  return (
    <Stack>
      <Text size="support" tone="muted">
        {t.resumo(ficha.funcionariosEmCampo, remessa.fornecedor.razaoSocial)}
      </Text>
      <Table
        caption={t.caption}
        columns={colunas}
        rows={remessa.pessoas}
        rowKey={(p) => p.funcionario.id}
        action={{ label: () => t.acao, describe: (p) => p.funcionario.nome, onClick: (p) => onAbrirPessoa(p.funcionario.id) }}
      />
    </Stack>
  );
}

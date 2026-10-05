import { formatCpf } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Badge, Mono, Table, type TableColumn } from '@/shared/ui';
import type { PessoaNaRemessa } from '../types';

const t = strings.pages.remessa;

const COLUNAS: readonly TableColumn<PessoaNaRemessa>[] = [
  { key: 'nome', header: t.colunas.funcionario, tone: 'strong', mobile: 'title', cell: (p) => p.funcionario.nome },
  { key: 'cpf', header: t.colunas.cpf, nowrap: true, cell: (p) => <Mono>{formatCpf(p.funcionario.cpf)}</Mono> },
  { key: 'funcao', header: t.colunas.funcao, cell: (p) => p.funcionario.funcao },
  { key: 'docs', header: t.colunas.documentos, cell: (p) => strings.dominio.documentosDe(p.enviados, p.exigidos) },
  { key: 'situacao', header: t.colunas.situacao, mobile: 'badge', cell: (p) => <Badge status={p.funcionario.status} /> },
];

type RemessaTabelaProps = {
  pessoas: readonly PessoaNaRemessa[];
  onAbrir: (funcionarioId: string) => void;
};

/** Pessoas da remessa. "Analisar" pede atenção (botão com borda); quem já foi decidido tem "Ver". */
export function RemessaTabela({ pessoas, onAbrir }: RemessaTabelaProps) {
  return (
    <Table
      caption={t.caption}
      columns={COLUNAS}
      rows={pessoas}
      rowKey={(p) => p.funcionario.id}
      action={{
        label: (p) => (p.funcionario.status === 'emAnalise' ? t.analisar : t.ver),
        describe: (p) => p.funcionario.nome,
        emphasis: (p) => p.funcionario.status === 'emAnalise',
        onClick: (p) => onAbrir(p.funcionario.id),
      }}
    />
  );
}

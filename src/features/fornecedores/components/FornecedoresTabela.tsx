import { useNavigate } from 'react-router';
import { formatCnpj, paths } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Badge, Mono, Table, type TableColumn } from '@/shared/ui';
import type { LinhaFornecedor } from '../types';
import { SituacaoFornecedor } from './SituacaoFornecedor';

const t = strings.pages.fornecedores;

const COLUNAS: readonly TableColumn<LinhaFornecedor>[] = [
  { key: 'nome', header: t.colunas.fornecedor, tone: 'strong', mobile: 'title', cell: (l) => l.fornecedor.razaoSocial },
  { key: 'cnpj', header: t.colunas.cnpj, nowrap: true, cell: (l) => <Mono>{formatCnpj(l.fornecedor.cnpj)}</Mono> },
  { key: 'tipo', header: t.colunas.tipo, cell: (l) => <Badge status={l.fornecedor.tipo} /> },
  { key: 'obras', header: t.colunas.obras, nowrap: true, cell: (l) => t.obras(l.resumo.obras) },
  { key: 'listas', header: t.colunas.listas, cell: (l) => l.resumo.listasAplicaveis },
  { key: 'docs', header: t.colunas.documentos, nowrap: true, cell: (l) => strings.dominio.documentosDe(l.resumo.obrigatoriosEmDia, l.resumo.obrigatoriosTotal) },
  {
    key: 'situacao',
    header: t.colunas.situacao,
    mobile: 'badge',
    cell: (l) => <SituacaoFornecedor situacao={l.resumo.situacao} aguardandoAcesso={l.aguardandoAcesso} />,
  },
];

type Props = { linhas: readonly LinhaFornecedor[]; onReenviar: (id: string) => void };

/** A linha abre a ficha. Quem ainda não entrou no portal tem "Reenviar acesso" no botão da linha. */
export function FornecedoresTabela({ linhas, onReenviar }: Props) {
  const navigate = useNavigate();
  return (
    <Table
      caption={t.caption}
      columns={COLUNAS}
      rows={linhas}
      rowKey={(l) => l.fornecedor.id}
      rowTo={(l) => paths.fornecedor(l.fornecedor.id)}
      action={{
        label: (l) => (l.aguardandoAcesso ? t.reenviar : t.abrir),
        describe: (l) => l.fornecedor.razaoSocial,
        emphasis: (l) => l.aguardandoAcesso,
        onClick: (l) => (l.aguardandoAcesso ? onReenviar(l.fornecedor.id) : navigate(paths.fornecedor(l.fornecedor.id))),
      }}
    />
  );
}

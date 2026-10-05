import { formatDate } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Badge, Button, Inline, Mono, Table, Text, type TableColumn } from '@/shared/ui';
import type { ArquivoNaAnalise } from '../types';

const t = strings.pages.envio;

type Props = {
  arquivos: readonly ArquivoNaAnalise[];
  comValidade: boolean;
  onVisualizar: (id: string) => void;
  onAprovar: (id: string) => void;
  onReprovar: (id: string) => void;
};

/** Um arquivo por linha. Em análise: Aprovar e Reprovar na própria linha. Decidido: quem e quando. */
export function ArquivosTabela({ arquivos, comValidade, onVisualizar, onAprovar, onReprovar }: Props) {
  const colunas: readonly TableColumn<ArquivoNaAnalise>[] = [
    { key: 'nome', header: t.colunas.arquivo, tone: 'strong', mobile: 'title', cell: ({ arquivo }) => <span className="break-all">{arquivo.nome}</span> },
    {
      key: 'validade',
      header: t.colunas.validade,
      nowrap: true,
      cell: ({ arquivo }) => {
        const data = arquivo.validade ?? arquivo.validadeInformada;
        return comValidade && data ? <Mono>{formatDate(data, 'date')}</Mono> : t.semValidade;
      },
    },
    { key: 'situacao', header: t.colunas.situacao, mobile: 'badge', cell: ({ status }) => <Badge status={status} /> },
    {
      key: 'decisao',
      header: t.colunas.decisao,
      cell: ({ arquivo }) =>
        arquivo.status === 'emAnalise' ? (
          <Inline gap="xs" wrap={false}>
            <Button variant="tertiary" size="sm" aria-label={t.reprovarArquivo(arquivo.nome)} onClick={() => onReprovar(arquivo.id)}>
              {t.reprovar}
            </Button>
            <Button variant="secondary" size="sm" aria-label={t.aprovarArquivo(arquivo.nome)} onClick={() => onAprovar(arquivo.id)}>
              {t.aprovar}
            </Button>
          </Inline>
        ) : arquivo.decisao ? (
          <Text as="span" size="support" tone="muted">
            {t.decididoPor(arquivo.decisao.por, formatDate(arquivo.decisao.em, 'date'))}
            {arquivo.decisao.motivo && ` ${strings.common.separator} ${strings.dominio.motivos[arquivo.decisao.motivo]}`}
          </Text>
        ) : (
          strings.common.emptyValue
        ),
    },
  ];
  return (
    <Table
      caption={t.caption}
      columns={colunas}
      rows={arquivos}
      rowKey={({ arquivo }) => arquivo.id}
      action={{ label: () => t.visualizar, describe: ({ arquivo }) => arquivo.nome, onClick: ({ arquivo }) => onVisualizar(arquivo.id) }}
    />
  );
}

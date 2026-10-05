import { useNavigate } from 'react-router';
import { formatDate, paths, type Origem } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Badge, Heading, Inline, Mono, Stack, Table, Tag, Text, type TableColumn } from '@/shared/ui';
import type { DocumentoFuncionarioNaFicha, DocumentoNaFicha, GrupoDocumentos } from '../types';

const t = strings.pages.fornecedor.documentos;

function Data({ iso }: { iso: string | undefined }) {
  return iso ? <Mono>{formatDate(iso, 'date')}</Mono> : null;
}

const COLUNAS: readonly TableColumn<DocumentoNaFicha>[] = [
  { key: 'doc', header: t.colunas.documento, tone: 'strong', mobile: 'title', cell: (d) => d.exigido.nome },
  { key: 'tipo', header: t.colunas.tipo, width: 'w-27.5', cell: (d) => <Tag kind={d.exigido.obrigatoriedade} /> },
  { key: 'status', header: t.colunas.status, width: 'w-35', mobile: 'badge', cell: (d) => <Badge status={d.naFila ? 'emAnalise' : d.status} /> },
  {
    key: 'validade',
    header: t.colunas.validade,
    width: 'w-32.5',
    nowrap: true,
    cell: (d) =>
      d.exigido.item.validade === 'semValidade' ? t.semValidade : d.documento?.validade ? <Data iso={d.documento.validade} /> : strings.common.emptyValue,
  },
  {
    key: 'ultimo',
    header: t.colunas.ultimo,
    width: 'w-37.5',
    nowrap: true,
    cell: (d) => {
      const envio = d.documento?.renovacao?.enviadoEm ?? d.documento?.enviadoEm;
      return envio ? <Data iso={envio} /> : t.naoEnviado;
    },
  },
];

const tf = t.funcionario;

function situacaoFuncionario(d: DocumentoFuncionarioNaFicha) {
  const r = d.resumo;
  if (r.total === 0) return 'semArquivos' as const;
  if (r.emAnalise > 0) return 'emAnalise' as const;
  if (r.reprovados > 0) return 'reprovado' as const;
  if (r.vencidos > 0) return 'vencido' as const;
  return 'emDia' as const;
}

const COLUNAS_FUNCIONARIO: readonly TableColumn<DocumentoFuncionarioNaFicha>[] = [
  { key: 'doc', header: tf.colunas.documento, tone: 'strong', mobile: 'title', cell: (d) => d.exigido.nome },
  { key: 'tipo', header: tf.colunas.tipo, width: 'w-27.5', cell: (d) => <Tag kind={d.exigido.obrigatoriedade} /> },
  { key: 'arquivos', header: tf.colunas.arquivos, cell: (d) => strings.dominio.resumoArquivos(d.resumo) },
  { key: 'situacao', header: tf.colunas.situacao, width: 'w-35', mobile: 'badge', cell: (d) => <Badge status={situacaoFuncionario(d)} /> },
  { key: 'ultimo', header: tf.colunas.ultimo, width: 'w-37.5', nowrap: true, cell: (d) => (d.ultimoEnvio ? <Data iso={d.ultimoEnvio} /> : t.naoEnviado) },
];

type Props = { grupo: GrupoDocumentos; origem: Origem };

/** Uma lista de exigências: documentos da empresa e, abaixo, os documentos de funcionário. */
export function GrupoDocumentosTabela({ grupo, origem }: Props) {
  const navigate = useNavigate();
  const { lista, obras } = grupo.aplicavel;
  const emDia = grupo.obrigatoriosEmDia === grupo.obrigatoriosTotal;
  return (
    <Stack gap="sm">
      <Inline gap="sm">
        <Heading level={3}>{lista.nome}</Heading>
        <Badge status={lista.tipo} />
        <Text as="span" size="support" tone="muted" className="min-w-0 flex-1">
          {t.meta(obras.map((o) => o.nome), grupo.obrigatoriosEmDia, grupo.obrigatoriosTotal)}
        </Text>
        <Badge status={emDia ? 'emDia' : 'comPendencia'} />
      </Inline>
      {grupo.documentos.length > 0 && (
        <Table
          caption={t.caption(lista.nome)}
          columns={COLUNAS}
          rows={grupo.documentos}
          rowKey={(d) => d.exigido.tipoDocumentoId}
          action={{
            label: (d) => (d.naFila ? t.analisar : t.ver),
            describe: (d) => d.exigido.nome,
            emphasis: (d) => d.naFila,
            disabled: (d) => !d.documento,
            onClick: (d) => d.documento && navigate(paths.analise(d.documento.id, origem)),
          }}
        />
      )}
      {grupo.funcionario.length > 0 && (
        <>
          <Table
            caption={tf.caption(lista.nome)}
            columns={COLUNAS_FUNCIONARIO}
            rows={grupo.funcionario}
            rowKey={(d) => d.exigido.tipoDocumentoId}
            action={{
              label: (d) => (d.resumo.emAnalise > 0 ? tf.analisar : tf.ver),
              describe: (d) => d.exigido.nome,
              emphasis: (d) => d.resumo.emAnalise > 0,
              disabled: (d) => !d.envioAlvo,
              onClick: (d) => d.envioAlvo && navigate(paths.envio(d.envioAlvo.id, origem)),
            }}
          />
          <Text size="label" tone="faint">
            {tf.nota}
          </Text>
        </>
      )}
    </Stack>
  );
}

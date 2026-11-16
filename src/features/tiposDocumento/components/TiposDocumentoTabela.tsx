import type { DefinicaoDocumento, FormatoArquivo } from '@/entities/tipoDocumento';
import { strings } from '@/shared/strings';
import { Table, type TableColumn } from '@/shared/ui';
import { formatarTamanho } from '../lib';

const t = strings.pages.tiposDocumento;

/** Tudo o que a listagem da API traz de cada tipo, com os nomes dos formatos (GET document-formats). */
export function TiposDocumentoTabela({
  tipos,
  formatos,
  onEditar,
}: {
  tipos: readonly DefinicaoDocumento[];
  formatos: readonly FormatoArquivo[];
  onEditar: (tipo: DefinicaoDocumento) => void;
}) {
  const nomesFormatos = (ids: readonly number[]) => ids.map((id) => formatos.find((f) => f.id === id)?.nome ?? String(id)).join(', ');
  const colunas: readonly TableColumn<DefinicaoDocumento>[] = [
    {
      key: 'nome',
      header: t.colunas.nome,
      tone: 'strong',
      mobile: 'title',
      cell: (d) => (
        <span>
          {d.nome}
          {d.descricao && <span className="block text-support font-normal text-ink-3">{d.descricao}</span>}
        </span>
      ),
    },
    { key: 'validade', header: t.colunas.validade, nowrap: true, cell: (d) => (d.validadeDias === null ? t.naoVence : t.validade(d.validadeDias)) },
    { key: 'tamanho', header: t.colunas.tamanho, nowrap: true, cell: (d) => formatarTamanho(d.tamanhoMaxBytes) },
    { key: 'formatos', header: t.colunas.formatos, cell: (d) => nomesFormatos(d.formatoIds) },
    { key: 'reaproveitavel', header: t.colunas.reaproveitavel, nowrap: true, cell: (d) => (d.reaproveitavel ? t.sim : t.nao) },
  ];
  return (
    <Table
      caption={t.caption}
      columns={colunas}
      rows={tipos}
      rowKey={(d) => d.id}
      action={{ label: () => t.editar, describe: (d) => d.nome, onClick: onEditar }}
    />
  );
}

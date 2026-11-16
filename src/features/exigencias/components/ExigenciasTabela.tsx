import type { Exigencia } from '@/entities/exigencias';
import type { DefinicaoDocumento, FormatoArquivo } from '@/entities/tipoDocumento';
import { strings } from '@/shared/strings';
import { Mono, Table, Tag, type TableColumn } from '@/shared/ui';

const t = strings.pages.lista;
const tt = strings.pages.tiposDocumento;

type Linha = Exigencia & { posicao: number; definicao: DefinicaoDocumento | undefined; formatos: string };

/** Documentos de uma versão, na ordem; validade e formatos vêm do tipo de documento. */
export function ExigenciasTabela({
  exigencias,
  definicoes,
  formatos,
  caption,
}: {
  exigencias: readonly Exigencia[];
  definicoes: readonly DefinicaoDocumento[];
  formatos: readonly FormatoArquivo[];
  caption: string;
}) {
  const linhas: Linha[] = exigencias.map((e, i) => {
    const definicao = definicoes.find((d) => d.id === e.definicaoId);
    return {
      ...e,
      posicao: i + 1,
      definicao,
      formatos: (definicao?.formatoIds ?? []).map((id) => formatos.find((f) => f.id === id)?.nome ?? String(id)).join(', '),
    };
  });
  const colunas: readonly TableColumn<Linha>[] = [
    { key: 'ordem', header: t.colunas.ordem, nowrap: true, mobile: 'hide', cell: (l) => <Mono>{l.posicao}</Mono> },
    { key: 'documento', header: t.colunas.documento, tone: 'strong', mobile: 'title', cell: (l) => l.definicao?.nome ?? t.documentoRemovido },
    { key: 'exigencia', header: t.colunas.exigencia, mobile: 'badge', cell: (l) => <Tag kind={l.obrigatoria ? 'obrigatorio' : 'opcional'} /> },
    {
      key: 'validade',
      header: t.colunas.validade,
      nowrap: true,
      cell: (l) => (l.definicao ? (l.definicao.validadeDias === null ? tt.naoVence : tt.validade(l.definicao.validadeDias)) : null),
    },
    { key: 'formatos', header: t.colunas.formatos, cell: (l) => l.formatos },
  ];
  return <Table caption={caption} columns={colunas} rows={linhas} rowKey={(l) => l.definicaoId} />;
}

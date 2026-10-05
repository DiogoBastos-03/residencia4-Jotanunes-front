import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import type { ListaAplicavel } from '@/entities';
import { composicaoLista } from '@/entities';
import { paths } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Badge, EmptyState, InfoNote, Stack, Table, Text, type TableColumn } from '@/shared/ui';
import type { FichaFornecedor } from '../types';

const t = strings.pages.fornecedor.exigencias;

export function AbaExigenciasFornecedor({ ficha }: { ficha: FichaFornecedor }) {
  const linhas = ficha.grupos.map((g) => ({ aplicavel: g.aplicavel, emDia: g.obrigatoriosEmDia === g.obrigatoriosTotal }));
  const colunas: readonly TableColumn<{ aplicavel: ListaAplicavel; emDia: boolean }>[] = [
    { key: 'nome', header: t.colunas.lista, tone: 'strong', mobile: 'title', cell: (l) => l.aplicavel.lista.nome },
    { key: 'tipo', header: t.colunas.tipo, cell: (l) => <Badge status={l.aplicavel.lista.tipo} /> },
    {
      key: 'obras',
      header: t.colunas.obras,
      tone: 'soft',
      cell: (l) => (
        <>
          {l.aplicavel.obras[0]?.nome}{' '}
          <Text as="span" tone="faint">
            {strings.dominio.obrasExtras(l.aplicavel.obras.length - 1)}
          </Text>
        </>
      ),
    },
    {
      key: 'itens',
      header: t.colunas.itens,
      cell: (l) => {
        const c = composicaoLista(l.aplicavel.lista);
        return strings.dominio.composicao(c.documentosObrigatorios, c.documentosOpcionais, c.documentosFuncionario);
      },
    },
    { key: 'situacao', header: t.colunas.situacao, mobile: 'badge', cell: (l) => <Badge status={l.emDia ? 'emDia' : 'comPendencia'} /> },
  ];
  const f = ficha.fornecedor;
  return (
    <Stack>
      <Text size="support" tone="muted">
        {t.intro}
      </Text>
      {linhas.length === 0 ? (
        <EmptyState icon={ClipboardDocumentListIcon} title={t.vazioTitle} description={t.vazioDescription} />
      ) : (
        <Table caption={t.caption} columns={colunas} rows={linhas} rowKey={(l) => l.aplicavel.lista.id} rowTo={(l) => paths.lista(l.aplicavel.lista.id)} />
      )}
      {ficha.ignoradas.length > 0 && (
        <InfoNote title={t.ignoradasTitle}>
          {ficha.ignoradas.map(({ lista, obras }) => (
            <p key={lista.id}>
              {t.ignorada(lista.nome, strings.status[lista.tipo], obras.length, f.razaoSocial, strings.dominio.tipos(f.tipos))}
            </p>
          ))}
        </InfoNote>
      )}
    </Stack>
  );
}

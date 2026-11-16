import type { VersaoLista } from '@/entities/exigencias';
import type { DefinicaoDocumento } from '@/entities/tipoDocumento';
import { formatDate } from '@/shared/lib';
import { numeroVersao } from '@/shared/strings/pages/exigencias';
import { strings } from '@/shared/strings';
import { Block, Inline, Mono, Tag, Text } from '@/shared/ui';

const t = strings.pages.lista;

/** Todas as versões (GET …/versions), da mais nova para a mais antiga. Versões são imutáveis. */
export function VersoesLista({ versoes, vigenteId, definicoes }: { versoes: readonly VersaoLista[]; vigenteId: string; definicoes: readonly DefinicaoDocumento[] }) {
  const nomeDe = (id: string) => definicoes.find((d) => d.id === id)?.nome ?? t.documentoRemovido;
  const ordenadas = [...versoes].sort((a, b) => b.numero - a.numero);
  return (
    <Block title={t.versoes} description={t.versoesDescricao}>
      <ul className="divide-y divide-border">
        {ordenadas.map((v) => (
          <li key={v.id} className="px-4 py-3">
            <Inline gap="sm">
              <Text weight="medium">{t.versao(numeroVersao(v.numero))}</Text>
              {v.id === vigenteId && <span className="rounded-badge bg-ok-bg px-1.5 py-0.5 text-label font-medium text-ok">{t.versaoAtual}</span>}
              <Text as="span" size="support" tone="muted">
                {t.versaoResumo(formatDate(v.criadaEm, 'dateTime'), v.exigencias.length)}
              </Text>
            </Inline>
            <ol className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {v.exigencias.map((e, i) => (
                <li key={e.definicaoId} className="flex items-center gap-1.5 text-support text-ink-2">
                  <Mono className="text-ink-3">{i + 1}.</Mono>
                  <span>{nomeDe(e.definicaoId)}</span>
                  {!e.obrigatoria && <Tag kind="opcional" />}
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ul>
    </Block>
  );
}

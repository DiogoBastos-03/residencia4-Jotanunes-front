import { formatCnpj, formatDate } from '@/shared/lib';
import { strings } from '@/shared/strings';
import type { DetalheEnvio } from '../types';

const t = strings.pages.analise.viewer;
const LARGURAS = ['w-full', 'w-11/12', 'w-5/6', 'w-[92%]', 'w-3/5', 'w-full', 'w-4/5', 'w-[94%]', 'w-1/2'];

function Linhas({ inicio, quantas }: { inicio: number; quantas: number }) {
  return (
    <div className="flex flex-col gap-1.75">
      {Array.from({ length: quantas }, (_, i) => (
        <span key={i} className={`h-1.75 bg-surface-3 ${LARGURAS[(inicio + i) % LARGURAS.length] ?? 'w-full'}`} />
      ))}
    </div>
  );
}

/** Folha simulada do documento. Muda o desenho a cada página. */
export function DocumentPreview({ detalhe, pagina }: { detalhe: DetalheEnvio; pagina: number }) {
  return (
    <div className="w-full max-w-107.5 border border-border bg-surface px-9.5 py-8.5 max-sm:px-5 max-sm:py-6">
      <p className="text-tag font-medium text-ink-4 uppercase">
        {detalhe.fornecedor.razaoSocial} — {formatCnpj(detalhe.fornecedor.cnpj)}
      </p>
      <p className="mt-3 text-block font-semibold">{detalhe.exigido.nome}</p>
      <span className="my-3 block h-px bg-border" />
      <Linhas inicio={pagina} quantas={5} />
      <p className="mt-5 text-label font-semibold">{t.secao}</p>
      <div className="mt-2.5">
        <Linhas inicio={pagina + 3} quantas={4} />
      </div>
      <div className="mt-4 border border-border">
        <div className="flex border-b border-border bg-surface-2">
          {t.tabela.map((coluna, i) => (
            <span key={coluna} className={`px-2 py-1.5 text-tag text-ink-4 ${i === 0 ? 'flex-2' : 'flex-1'}`}>
              {coluna}
            </span>
          ))}
        </div>
        {[0, 1].map((linha) => (
          <div key={linha} className="flex border-b border-border last:border-b-0">
            {t.tabela.map((coluna, i) => (
              <span key={coluna} className={`px-2 py-1.75 ${i === 0 ? 'flex-2' : 'flex-1'}`}>
                <span className="block h-1.5 bg-surface-3" />
              </span>
            ))}
          </div>
        ))}
      </div>
      <p className="mt-5 text-tag text-ink-4">{t.rodape(formatDate(detalhe.enviadoEm, 'date'), pagina, detalhe.paginas)}</p>
    </div>
  );
}

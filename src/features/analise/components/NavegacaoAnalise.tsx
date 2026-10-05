import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import type { Origem } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { IconButton, Text } from '@/shared/ui';
import { rotaDoAlvo } from '../lib';
import type { Sequencia } from '../types';

const t = strings.pages.analise.navegacao;

/** Alvo de digitação: as setas ali movem o cursor, não o documento. */
function digitando(alvo: EventTarget | null): boolean {
  return alvo instanceof HTMLElement && (alvo.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(alvo.tagName));
}

/** "3 de 7" com anterior e próximo; as setas ← e → do teclado fazem o mesmo. */
export function NavegacaoAnalise({ sequencia, origem }: { sequencia: Sequencia; origem: Origem }) {
  const navigate = useNavigate();
  const { anterior, proximo, indice, alvos } = sequencia;

  useEffect(() => {
    function handle(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey || digitando(event.target)) return;
      if (document.querySelector('[role="dialog"]')) return;
      if (event.key === 'ArrowLeft' && anterior) navigate(rotaDoAlvo(anterior, origem));
      else if (event.key === 'ArrowRight' && proximo) navigate(rotaDoAlvo(proximo, origem));
    }
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [anterior, proximo, origem, navigate]);

  if (alvos.length === 0) return null;
  const atual = indice >= 0 ? indice + 1 : 0;
  return (
    <div className="flex items-center gap-1.5" title={t.dica}>
      <IconButton icon={ChevronLeftIcon} label={t.anterior} disabled={!anterior} onClick={() => anterior && navigate(rotaDoAlvo(anterior, origem))} />
      <Text as="span" size="support" tone="muted" className="tabular min-w-14 text-center" aria-live="polite">
        <span aria-hidden="true">{t.posicao(atual, alvos.length)}</span>
        <span className="sr-only">{t.posicaoLabel(atual, alvos.length)}</span>
      </Text>
      <IconButton icon={ChevronRightIcon} label={t.proximo} disabled={!proximo} onClick={() => proximo && navigate(rotaDoAlvo(proximo, origem))} />
    </div>
  );
}

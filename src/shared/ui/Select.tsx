import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { CheckIcon, ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { cn } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { controlClasses } from './controlStyles';
import { Icon } from './Icon';
import { Portal } from './Portal';

export type SelectOption = { value: string; label: string };

/** Mesmo formato do evento do <select> nativo que este componente substituiu: `e.target.value`. */
export type SelectChange = { target: { value: string } };

type SelectProps = {
  options: readonly SelectOption[];
  value: string;
  onChange: (event: SelectChange) => void;
  invalid?: boolean;
  size?: 'sm' | 'md';
  /** Classe do contêiner (largura). */
  wrapperClassName?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  /** Começa aberta. Só para a vitrine em /_componentes. */
  abertoInicial?: boolean;
};

/** Acima disto, a lista ganha um campo de busca no topo. */
const LIMITE_SEM_BUSCA = 8;
/** Altura máxima da lista aberta; o resto rola dentro dela. */
const ALTURA_MAX = 288;
const MARGEM = 8;
const GUTTER = 16;
/** Pausa que encerra a digitação para "pular para a opção que começa com…". */
const PAUSA_DIGITACAO_MS = 500;

const normalizar = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

type Posicao = { left: number; width: number; maxHeight: number; top?: number; bottom?: number; paraCima: boolean };

/** Ancorada ao campo: abaixo dele, ou acima quando embaixo não cabe e em cima cabe mais. Nunca sai da tela. */
function calcularPosicao(campo: HTMLElement, alturaConteudo: number): Posicao {
  const r = campo.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const abaixo = vh - r.bottom - MARGEM;
  const acima = r.top - MARGEM;
  const desejada = Math.min(alturaConteudo, ALTURA_MAX);
  const paraCima = abaixo < desejada && acima > abaixo;
  const maxHeight = Math.max(96, Math.min(ALTURA_MAX, paraCima ? acima : abaixo));
  const width = Math.min(Math.max(r.width, 200), vw - GUTTER * 2);
  const left = Math.min(Math.max(r.left, GUTTER), vw - GUTTER - width);
  return paraCima ? { left, width, maxHeight, bottom: vh - r.top + 4, paraCima } : { left, width, maxHeight, top: r.bottom + 4, paraCima };
}

/**
 * Seleção do design system (substitui o <select> nativo): a lista aberta usa os nossos tokens
 * e é desenhada em portal, ancorada ao campo, então não é cortada por drawer, modal ou
 * qualquer contêiner com overflow. Padrão "select-only combobox" da WAI-ARIA:
 * - campo: role="combobox" com aria-expanded, aria-controls e aria-activedescendant;
 * - lista: role="listbox"; opções: role="option" com aria-selected.
 * Teclado: Enter/Espaço/↓ abrem; ↑↓ movem; Home/End; letras pulam para a opção;
 * Enter escolhe; Esc fecha e devolve o foco ao campo; Tab fecha e segue a navegação.
 * Com mais de 8 opções, a lista tem busca no topo (o foco vai para ela ao abrir).
 */
export function Select({
  options,
  value,
  onChange,
  invalid = false,
  size = 'md',
  wrapperClassName,
  className,
  disabled = false,
  id,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  abertoInicial = false,
}: SelectProps) {
  const autoId = useId();
  const campoId = id ?? `${autoId}-campo`;
  const listaId = `${autoId}-lista`;
  const opcaoId = (i: number) => `${autoId}-opcao-${i}`;

  const campoRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const listaRef = useRef<HTMLUListElement>(null);
  const buscaRef = useRef<HTMLInputElement>(null);
  const digitado = useRef({ texto: '', timer: 0 });

  const [aberto, setAberto] = useState(abertoInicial && !disabled);
  const [busca, setBusca] = useState('');
  const [ativo, setAtivo] = useState(0);
  const [posicao, setPosicao] = useState<Posicao | null>(null);

  const comBusca = options.length > LIMITE_SEM_BUSCA;
  const termo = normalizar(busca.trim());
  const visiveis = termo ? options.filter((o) => normalizar(o.label).includes(termo)) : options;
  const selecionada = options.find((o) => o.value === value);

  const reposicionar = useCallback(() => {
    const campo = campoRef.current;
    if (!campo) return;
    setPosicao(calcularPosicao(campo, popupRef.current?.scrollHeight ?? ALTURA_MAX));
  }, []);

  const abrir = useCallback(
    (inicio?: number) => {
      if (disabled) return;
      const atual = options.findIndex((o) => o.value === value);
      setBusca('');
      setAtivo(inicio ?? Math.max(atual, 0));
      setAberto(true);
    },
    [disabled, options, value],
  );

  const fechar = useCallback((devolverFoco: boolean) => {
    setAberto(false);
    setBusca('');
    setPosicao(null);
    if (devolverFoco) campoRef.current?.focus();
  }, []);

  const escolher = (i: number) => {
    const opcao = visiveis[i];
    if (!opcao) return;
    if (opcao.value !== value) onChange({ target: { value: opcao.value } });
    fechar(true);
  };

  // Posição: ao abrir, ao filtrar e enquanto o campo se move (rolagem em qualquer contêiner, redimensionamento).
  useLayoutEffect(() => {
    if (aberto) reposicionar();
  }, [aberto, reposicionar, visiveis.length]);

  useEffect(() => {
    if (!aberto) return;
    const campo = campoRef.current;
    window.addEventListener('scroll', reposicionar, true);
    window.addEventListener('resize', reposicionar);
    const observador = new ResizeObserver(reposicionar);
    if (campo) observador.observe(campo);
    return () => {
      window.removeEventListener('scroll', reposicionar, true);
      window.removeEventListener('resize', reposicionar);
      observador.disconnect();
    };
  }, [aberto, reposicionar]);

  // Clique fora fecha (sem roubar o foco de onde o usuário clicou).
  useEffect(() => {
    if (!aberto) return;
    function fora(e: PointerEvent) {
      const alvo = e.target;
      if (!(alvo instanceof Node)) return;
      if (campoRef.current?.contains(alvo) || popupRef.current?.contains(alvo)) return;
      fechar(false);
    }
    document.addEventListener('pointerdown', fora);
    return () => document.removeEventListener('pointerdown', fora);
  }, [aberto, fechar]);

  // Com busca, o foco vai para ela ao abrir (depois que a lista já tem posição).
  const posicionada = posicao !== null;
  useEffect(() => {
    if (aberto && comBusca && posicionada) buscaRef.current?.focus();
  }, [aberto, comBusca, posicionada]);

  // A opção ativa fica sempre visível dentro da lista.
  useEffect(() => {
    if (!aberto) return;
    const item = listaRef.current?.querySelector<HTMLElement>(`[data-indice="${ativo}"]`);
    item?.scrollIntoView({ block: 'nearest' });
  }, [aberto, ativo]);

  useEffect(() => () => window.clearTimeout(digitado.current.timer), []);

  /** Letras digitadas pulam para a primeira opção que começa com elas (a mesma letra repetida percorre as opções). */
  const pularPara = (letra: string) => {
    const d = digitado.current;
    window.clearTimeout(d.timer);
    d.texto += normalizar(letra);
    d.timer = window.setTimeout(() => (d.texto = ''), PAUSA_DIGITACAO_MS);
    const repetida = d.texto.length > 1 && [...d.texto].every((c) => c === d.texto[0]);
    const procura = repetida ? d.texto.slice(0, 1) : d.texto;
    const base = aberto ? ativo : Math.max(options.findIndex((o) => o.value === value), -1);
    const ordem = [...visiveis.keys()].map((k) => (base + 1 + k) % visiveis.length);
    const candidatos = repetida || d.texto.length === 1 ? ordem : [base, ...ordem];
    const achou = candidatos.find((i) => i >= 0 && normalizar(visiveis[i]?.label ?? '').startsWith(procura));
    if (achou === undefined) return;
    if (aberto) setAtivo(achou);
    else abrir(achou);
  };

  /** Teclas que valem tanto no campo quanto na busca. */
  const navegar = (e: KeyboardEvent<HTMLElement>, naBusca: boolean): boolean => {
    const ultimo = visiveis.length - 1;
    switch (e.key) {
      case 'ArrowDown':
        setAtivo((i) => Math.min(i + 1, ultimo));
        return true;
      case 'ArrowUp':
        setAtivo((i) => Math.max(i - 1, 0));
        return true;
      case 'Home':
        setAtivo(0);
        return true;
      case 'End':
        setAtivo(Math.max(ultimo, 0));
        return true;
      case 'Enter':
        escolher(ativo);
        return true;
      case ' ':
        if (naBusca) return false;
        escolher(ativo);
        return true;
      case 'Escape':
        // Não deixa o Esc chegar ao modal ou drawer: fecha só a lista.
        e.stopPropagation();
        fechar(true);
        return true;
      default:
        return false;
    }
  };

  function teclaNoCampo(e: KeyboardEvent<HTMLButtonElement>) {
    if (!aberto) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        abrir();
        return;
      }
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        if (comBusca) {
          abrir();
          setBusca(e.key);
        } else pularPara(e.key);
      }
      return;
    }
    if (e.key === 'Tab') {
      fechar(false);
      return;
    }
    if (navegar(e, false)) {
      e.preventDefault();
      return;
    }
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      pularPara(e.key);
    }
  }

  function teclaNaBusca(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Tab') {
      // Volta o foco ao campo sem cancelar o Tab: a navegação segue a partir dele.
      fechar(true);
      return;
    }
    if (navegar(e, true)) e.preventDefault();
  }

  const opcaoAtiva = aberto && visiveis[ativo] ? opcaoId(ativo) : undefined;

  return (
    <div className={cn('relative', wrapperClassName ?? 'w-full')}>
      <button
        ref={campoRef}
        type="button"
        id={campoId}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-controls={aberto ? listaId : undefined}
        aria-activedescendant={comBusca ? undefined : opcaoAtiva}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        onClick={() => (aberto ? fechar(true) : abrir())}
        onKeyDown={teclaNoCampo}
        className={controlClasses(
          invalid,
          cn(
            'flex items-center pr-9 text-left',
            size === 'md' ? 'h-10 pl-3' : 'h-9 pl-2.5 text-support text-ink-2 max-md:min-h-tap',
            aberto && 'border-ink-4',
            className,
          ),
        )}
      >
        <span className="min-w-0 flex-1 truncate">{selecionada?.label ?? ''}</span>
      </button>
      <Icon
        icon={ChevronDownIcon}
        size={16}
        className={cn('pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink-3 transition-transform', aberto && 'rotate-180')}
      />
      {aberto && (
        <Portal>
          <div
            ref={popupRef}
            className={cn(
              'fixed z-40 flex flex-col overflow-hidden rounded-control border border-border bg-surface shadow-modal animate-tab-in',
              // Transparente (não invisible) até ter posição: invisible impediria o foco na busca.
              !posicao && 'opacity-0',
            )}
            style={posicao ? { left: posicao.left, width: posicao.width, maxHeight: posicao.maxHeight, top: posicao.top, bottom: posicao.bottom } : undefined}
          >
            {comBusca && (
              <div className="relative flex-none border-b border-border p-2">
                <Icon icon={MagnifyingGlassIcon} size={16} className="pointer-events-none absolute top-1/2 left-4.5 -translate-y-1/2 text-ink-4" />
                <input
                  ref={buscaRef}
                  type="search"
                  role="combobox"
                  aria-label={strings.ui.select.buscar}
                  aria-expanded
                  aria-controls={listaId}
                  aria-activedescendant={opcaoAtiva}
                  aria-autocomplete="list"
                  value={busca}
                  onChange={(e) => {
                    setBusca(e.target.value);
                    setAtivo(0);
                  }}
                  onKeyDown={teclaNaBusca}
                  placeholder={strings.ui.select.buscarPlaceholder}
                  className="focus-field h-9 w-full rounded-control border border-border-strong bg-surface pr-2 pl-8 text-support text-ink placeholder:text-ink-4 max-md:min-h-tap"
                />
              </div>
            )}
            <ul ref={listaRef} id={listaId} role="listbox" aria-labelledby={ariaLabel ? undefined : campoId} aria-label={ariaLabel} className="min-h-0 flex-1 overflow-y-auto py-1">
              {visiveis.map((o, i) => (
                <OpcaoItem
                  key={o.value}
                  id={opcaoId(i)}
                  indice={i}
                  ativa={i === ativo}
                  selecionada={o.value === value}
                  onEscolher={() => escolher(i)}
                  onApontar={() => setAtivo(i)}
                >
                  {o.label}
                </OpcaoItem>
              ))}
              {visiveis.length === 0 && <li className="px-3 py-2 text-support text-ink-3">{strings.ui.select.semResultado}</li>}
            </ul>
          </div>
        </Portal>
      )}
    </div>
  );
}

type OpcaoProps = { id: string; indice: number; ativa: boolean; selecionada: boolean; onEscolher: () => void; onApontar: () => void; children: ReactNode };

function OpcaoItem({ id, indice, ativa, selecionada, onEscolher, onApontar, children }: OpcaoProps) {
  return (
    <li
      id={id}
      role="option"
      aria-selected={selecionada}
      data-indice={indice}
      // O foco fica no campo (ou na busca): clicar não pode tirá-lo de lá antes da escolha.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onEscolher}
      onPointerMove={onApontar}
      className={cn(
        'flex min-h-9 cursor-pointer items-center gap-2 px-3 py-1.5 text-body text-ink max-md:min-h-tap',
        ativa && 'bg-surface-2',
        selecionada && 'font-medium',
      )}
    >
      <span className="min-w-0 flex-1 break-words">{children}</span>
      {selecionada && <Icon icon={CheckIcon} size={16} className="flex-none text-ink-2" />}
    </li>
  );
}

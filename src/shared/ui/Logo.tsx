import { cn } from '@/shared/lib';
import { strings } from '@/shared/strings';

/**
 * Arquivos da marca em src/app/brand/. Um nome com "simbolo" ou "symbol" é a versão só do
 * símbolo; qualquer outro é a versão com o nome. Se a pasta estiver vazia, nada quebra:
 * hasLogo() devolve false e quem usa mostra a alternativa.
 */
const ARQUIVOS = import.meta.glob<string>('/src/app/brand/*.{svg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
});

export type LogoVariant = 'symbol' | 'full';

function arquivo(variant: LogoVariant): string | undefined {
  const entradas = Object.entries(ARQUIVOS);
  const ehSimbolo = (caminho: string) => /simbolo|symbol/i.test(caminho);
  const encontrada = entradas.find(([caminho]) => (variant === 'symbol' ? ehSimbolo(caminho) : !ehSimbolo(caminho)));
  return encontrada?.[1];
}

export function hasLogo(variant: LogoVariant): boolean {
  return arquivo(variant) !== undefined;
}

type LogoProps = { variant: LogoVariant; className?: string };

/**
 * Logo da JotaNunes, sem recolorir nem filtrar. full: até 28px de altura, com alt (contém o nome).
 * symbol: 26×26, decorativo (o nome está escrito ao lado).
 */
export function Logo({ variant, className }: LogoProps) {
  const src = arquivo(variant);
  if (!src) return null;
  if (variant === 'full') {
    return <img src={src} alt={strings.common.appName} className={cn('block h-7 w-auto max-w-full object-contain', className)} />;
  }
  return <img src={src} alt="" aria-hidden="true" className={cn('block size-6.5 flex-none object-contain', className)} />;
}

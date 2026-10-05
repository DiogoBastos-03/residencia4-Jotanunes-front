import { strings } from '@/shared/strings';
import { hasLogo, Logo } from '@/shared/ui';

/**
 * Marca da sidebar e do topo móvel. Usa a logo de src/app/brand/:
 * com o nome → só a imagem; só o símbolo → símbolo + "JotaNunes"; nenhuma → quadrado "JN".
 */
export function BrandMark({ compact = false }: { compact?: boolean }) {
  const subtitulo = !compact && <p className="mt-0.75 text-label text-ink-3">{strings.common.productName}</p>;

  if (hasLogo('full')) {
    return (
      <div className="min-w-0">
        <Logo variant="full" />
        {subtitulo}
      </div>
    );
  }

  return (
    <div className="flex min-w-0 gap-2">
      {hasLogo('symbol') ? (
        <Logo variant="symbol" />
      ) : (
        <span
          aria-hidden="true"
          className="flex size-6.5 flex-none items-center justify-center rounded-control bg-primary text-tag font-semibold tracking-[0.02em] text-white"
        >
          {strings.common.brandMark}
        </span>
      )}
      <div className="min-w-0">
        <p className="text-brand font-semibold">{strings.common.appName}</p>
        {subtitulo}
      </div>
    </div>
  );
}

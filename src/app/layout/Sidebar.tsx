import { cn } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { BrandMark } from './BrandMark';
import { SidebarNav } from './SidebarNav';

type SidebarProps = {
  queueCount: number | undefined;
  className?: string;
  onNavigate?: () => void;
};

/** Marca, navegação e o aviso de acesso interno. */
export function Sidebar({ queueCount, className, onNavigate }: SidebarProps) {
  return (
    <div
      className={cn(
        'flex w-sidebar flex-none flex-col rounded-card border border-border bg-surface p-2',
        className,
      )}
    >
      <div className="px-1.5 pt-2 pb-3">
        <BrandMark />
      </div>
      <SidebarNav queueCount={queueCount} onNavigate={onNavigate} />
      <div className="mt-auto border-t border-border px-1.5 pt-3 pb-1">
        <p className="text-label font-medium text-ink-3">{strings.layout.footerTitle}</p>
        <p className="mt-0.75 text-label leading-[1.35] text-ink-4">{strings.layout.footerText}</p>
      </div>
    </div>
  );
}

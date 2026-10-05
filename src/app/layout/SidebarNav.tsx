import { NavLink } from 'react-router';
import { cn } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Icon } from '@/shared/ui';
import { NAV_ITEMS } from './navItems';

type SidebarNavProps = {
  /** Itens esperando na fila — aparece no item "Fila de análise". */
  queueCount: number | undefined;
  /** Chamado ao escolher um destino (fecha o menu móvel). */
  onNavigate?: () => void;
};

export function SidebarNav({ queueCount, onNavigate }: SidebarNavProps) {

  return (
    <nav aria-label={strings.layout.navLabel}>
      <ul className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'focus-ring interactive-color flex h-9 items-center gap-2 rounded-control px-2.5 text-support max-md:h-tap',
                  isActive
                    ? 'bg-primary-soft font-semibold text-primary-hover'
                    : 'font-medium text-ink-3 hover:bg-surface-2 hover:text-ink-2',
                )
              }
            >
              <Icon icon={item.icon} size={18} />
              <span className="flex-1">{item.label}</span>
              {item.queueCount && queueCount !== undefined && queueCount > 0 && (
                <span className="tabular rounded-badge bg-primary-soft px-1.5 py-0.5 text-label font-medium text-primary-hover">
                  <span aria-hidden="true">{queueCount}</span>
                  <span className="sr-only">{strings.layout.queueCount(queueCount)}</span>
                </span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

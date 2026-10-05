import { CheckCircleIcon, ExclamationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Icon } from './Icon';

export type ToastTone = 'success' | 'error';

type ToastProps = {
  message: string;
  tone?: ToastTone;
  onDismiss?: () => void;
};

/** Aviso curto no canto inferior direito. */
export function Toast({ message, tone = 'success', onDismiss }: ToastProps) {
  return (
    <div className="flex items-center gap-2.5 rounded-control border border-border bg-surface py-3 pr-2 pl-4 shadow-toast">
      <Icon
        icon={tone === 'success' ? CheckCircleIcon : ExclamationCircleIcon}
        size={16}
        className={tone === 'success' ? 'text-ok' : 'text-danger'}
      />
      <p className="flex-1 text-support font-medium">{message}</p>
      {onDismiss && (
        <button
          type="button"
          aria-label={strings.ui.toast.dismiss}
          onClick={onDismiss}
          className={cn(
            'focus-ring interactive-icon inline-flex size-6 flex-none items-center justify-center rounded-control text-ink-3 max-md:size-tap',
          )}
        >
          <Icon icon={XMarkIcon} size={16} />
        </button>
      )}
    </div>
  );
}

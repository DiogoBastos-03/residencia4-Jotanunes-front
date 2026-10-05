import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { strings } from '@/shared/strings';
import { Button, Text } from '@/shared/ui';

const t = strings.pages.remessa;

export function RemessaRodape({ aguardando, onConcluir }: { aguardando: number; onConcluir: () => void }) {
  return (
    <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
      <Text size="support" tone="muted">
        {aguardando > 0 ? t.rodapeAguardando(aguardando) : t.rodape}
      </Text>
      <Button variant="primary" icon={CheckCircleIcon} className="flex-none" onClick={onConcluir}>
        {t.concluir}
      </Button>
    </div>
  );
}

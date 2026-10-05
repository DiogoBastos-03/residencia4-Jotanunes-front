import { PaperClipIcon } from '@heroicons/react/24/outline';
import { strings } from '@/shared/strings';
import { Badge, Button, Icon, Tag, Text } from '@/shared/ui';
import type { DocumentoDaPessoa } from '../types';

const t = strings.pages.remessa.drawer;

type Props = {
  documento: DocumentoDaPessoa;
  /** Mostra Aprovar/Reprovar quando o documento ainda está em análise. */
  decidivel: boolean;
  onDecidir: (status: 'aprovado' | 'reprovado') => void;
};

export function DocumentoDaPessoaLinha({ documento, decidivel, onDecidir }: Props) {
  const { exigido, enviado, status } = documento;
  return (
    <li className="flex flex-wrap items-center gap-x-2.5 gap-y-2 border-b border-border px-4 py-3 last:border-b-0">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Text weight="medium">{exigido.nome}</Text>
          <Tag kind={exigido.obrigatoriedade} />
        </div>
        <Text size="label" tone="faint" className="mt-0.75 flex items-center gap-1">
          <Icon icon={PaperClipIcon} size={16} />
          <span className="min-w-0 break-all">{enviado?.arquivo ?? t.naoEnviado}</span>
        </Text>
      </div>
      <Badge status={status} />
      {decidivel && status === 'emAnalise' && (
        <div className="flex gap-1 max-sm:w-full">
          <Button variant="tertiary" size="sm" aria-label={t.reprovarDoc(exigido.nome)} onClick={() => onDecidir('reprovado')} className="max-sm:flex-1">
            {t.reprovar}
          </Button>
          <Button variant="secondary" size="sm" aria-label={t.aprovarDoc(exigido.nome)} onClick={() => onDecidir('aprovado')} className="max-sm:flex-1">
            {t.aprovar}
          </Button>
        </div>
      )}
    </li>
  );
}

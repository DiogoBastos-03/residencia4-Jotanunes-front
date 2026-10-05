import { MapIcon } from '@heroicons/react/24/outline';
import { paths, useDocumentTitle } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { ButtonLink, EmptyState } from '@/shared/ui';

const t = strings.pages.naoEncontrada;

export function NaoEncontradaPage() {
  useDocumentTitle(t.title);
  return (
    <EmptyState
      icon={MapIcon}
      title={t.title}
      description={t.description}
      action={
        <ButtonLink to={paths.visaoGeral} variant="secondary">
          {t.action}
        </ButtonLink>
      }
    />
  );
}

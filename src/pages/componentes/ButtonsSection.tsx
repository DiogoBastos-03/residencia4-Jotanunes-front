import {
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  PlusIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { strings } from '@/shared/strings';
import { Badge, Block, Button, IconButton, Inline, Stack, Tag, Text } from '@/shared/ui';
import type { StatusKey, TagKey } from '@/shared/strings';

const t = strings.pages.componentes;

const STATUSES: readonly StatusKey[] = [
  'aprovado',
  'emAnalise',
  'pendente',
  'venceEmBreve',
  'reprovado',
  'vencido',
  'apto',
  'comPendencia',
  'bloqueado',
  'urgente',
  'normal',
  'servico',
  'material',
  'emExecucao',
  'planejamento',
  'concluida',
  'semLista',
  'funcionarios',
];

const TAGS: readonly TagKey[] = ['obrigatorio', 'opcional', 'funcionarios', 'sempreObrigatorio', 'vaiSeAplicar', 'naoSeAplica'];

export function ButtonsSection() {
  return (
    <>
      <Block title={t.sections.buttons} padded>
        <Stack>
          <Inline>
            <Button variant="primary" icon={CheckCircleIcon}>
              {t.buttons.primary}
            </Button>
            <Button variant="secondary" icon={XCircleIcon}>
              {t.buttons.secondary}
            </Button>
            <Button variant="tertiary">{t.buttons.tertiary}</Button>
            <Button variant="link">{t.buttons.link}</Button>
            <Button variant="primary" icon={PlusIcon}>
              {t.buttons.add}
            </Button>
          </Inline>
          <Inline>
            <Button variant="primary" size="sm">
              {t.buttons.sm}
            </Button>
            <Button variant="secondary" size="sm">
              {t.buttons.sm}
            </Button>
            <Button variant="tertiary" size="sm" icon={ArrowDownTrayIcon}>
              {t.buttons.download}
            </Button>
            <Button variant="link" size="sm">
              {t.buttons.link}
            </Button>
          </Inline>
          <Inline>
            <Button variant="primary" disabled>
              {t.buttons.disabled}
            </Button>
            <Button variant="secondary" disabled>
              {t.buttons.disabled}
            </Button>
            <Button variant="tertiary" disabled>
              {t.buttons.disabled}
            </Button>
            <IconButton icon={ArrowLeftIcon} label={t.buttons.back} />
            <IconButton icon={XMarkIcon} label={t.buttons.close} variant="ghost" size="sm" />
            <IconButton icon={ArrowLeftIcon} label={t.buttons.back} disabled />
          </Inline>
          <Text size="label" tone="muted">
            {t.buttons.sizesNote}
          </Text>
        </Stack>
      </Block>

      <Block title={t.sections.badges} padded>
        <Stack>
          <Inline>
            {STATUSES.map((status) => (
              <Badge key={status} status={status} />
            ))}
          </Inline>
          <Inline>
            {TAGS.map((kind) => (
              <Tag key={kind} kind={kind} />
            ))}
          </Inline>
        </Stack>
      </Block>
    </>
  );
}

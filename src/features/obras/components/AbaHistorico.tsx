import { ClockIcon } from '@heroicons/react/24/outline';
import { formatDate } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { EmptyState, HistoryList } from '@/shared/ui';
import type { FichaObra } from '../types';

const t = strings.pages.obra.historico;

export function AbaHistorico({ ficha }: { ficha: FichaObra }) {
  if (ficha.historico.length === 0) return <EmptyState icon={ClockIcon} title={t.vazioTitle} description={t.vazioDescription} />;
  return (
    <HistoryList
      items={ficha.historico.map((e) => ({
        id: e.id,
        quando: formatDate(e.quando, 'dateTime'),
        autor: strings.eventos.autor(e.autor),
        descricao: strings.eventos.descricao(e.acao, 'obra'),
      }))}
    />
  );
}

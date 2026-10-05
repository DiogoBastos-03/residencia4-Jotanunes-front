import { datasetStore } from '@/mocks';
import { useStore } from '@/shared/lib';

/** "Hoje" do sistema (yyyy-MM-dd). Esperas e vencimentos são contados a partir dele. */
export function useHoje(): string {
  return useStore(datasetStore).hoje;
}

import type { Dataset } from '@/entities';
import { createStore } from '@/shared/lib';

function hojeLocal(): { hoje: string; agora: string } {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  const hoje = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  return { hoje, agora: `${hoje}T${p(d.getHours())}:${p(d.getMinutes())}` };
}

/**
 * FORA DE USO pelas telas em uso. Estrutura em memória das telas que saíram da interface
 * (fila, análise, exigências, relatórios e as abas documentais da ficha), que voltam quando
 * a API tiver os endpoints. Começa vazia: nenhum dado inventado.
 */
export const datasetStore = createStore<Dataset>({
  ...hojeLocal(),
  obras: [],
  obraListas: [],
  listas: [],
  tiposDocumento: [],
  fornecedores: [],
  vinculos: [],
  documentos: [],
  envios: [],
  arquivos: [],
  analises: [],
  eventos: [],
  temposAnalise: [],
});

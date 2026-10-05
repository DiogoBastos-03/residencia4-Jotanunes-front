import { fornecedorApi, hojeLocal, obraApi, type Fornecedor, type VinculoObra } from '@/entities';
import { atualizarFornecedor, gerarDemonstracao } from './gerar';
import { datasetStore } from './store';

/** Quantos detalhes de fornecedor pedir ao mesmo tempo. */
const LOTE = 6;

async function emLotes<T, R>(itens: readonly T[], fn: (item: T) => Promise<R>): Promise<R[]> {
  const resultado: R[] = [];
  for (let i = 0; i < itens.length; i += LOTE) resultado.push(...(await Promise.all(itens.slice(i, i + LOTE).map(fn))));
  return resultado;
}

/**
 * Fornecedores, obras e o vínculo entre eles, do banco. O item da listagem não traz
 * telefone, e-mail nem data, então cada fornecedor é detalhado. O vínculo sai do filtro
 * ?constructionIds= da listagem de fornecedores, obra a obra.
 */
async function carregarDoBanco(): Promise<void> {
  const [ids, obras] = await Promise.all([fornecedorApi.listarIds(), obraApi.listar()]);
  const fornecedores: Fornecedor[] = await emLotes(ids, (id) => fornecedorApi.detalhar(id));
  const vinculos: VinculoObra[] = (
    await emLotes(obras, async (obra) => (await fornecedorApi.listarIds({ constructionIds: [obra.id] })).map((fornecedorId) => ({ fornecedorId, obraId: obra.id })))
  ).flat();
  datasetStore.set((ds) => gerarDemonstracao({ ...ds, ...hojeLocal(), fornecedores, obras, vinculos }));
}

let carregamento: Promise<void> | null = null;

/**
 * Hidrata o dataset uma vez (no boot) e devolve a mesma promessa a quem pedir depois.
 * Se falhar, esquece a promessa: o "Tentar de novo" das telas chama de novo.
 */
export function garantirDataset(): Promise<void> {
  carregamento ??= carregarDoBanco().catch((erro: unknown) => {
    carregamento = null;
    throw erro;
  });
  return carregamento;
}

/** Depois de uma mutação: busca o fornecedor (e as obras dele) de novo na API. */
export async function recarregarFornecedor(id: string): Promise<void> {
  await garantirDataset();
  const [fornecedor, obras] = await Promise.all([fornecedorApi.detalhar(id), obraApi.listar({ enterpriseId: id })]);
  datasetStore.set((ds) => atualizarFornecedor(ds, fornecedor, obras.map((o) => o.id)));
}

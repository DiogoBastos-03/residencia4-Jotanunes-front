import type { EntradaFila } from '@/entities';
import { paths, type Origem } from '@/shared/lib';
import { strings } from '@/shared/strings';

/** Endereço de análise de um item da fila (documento ou envio de arquivos). */
export function rotaDaEntrada(entrada: EntradaFila, origem: Origem = { tipo: 'fila' }): string {
  return entrada.kind === 'envio' ? paths.envio(entrada.id, origem) : paths.analise(entrada.id, origem);
}

/** Nome do item: o documento exigido. */
export function nomeDaEntrada(entrada: EntradaFila): string {
  return entrada.documentoNome;
}

export type FiltrosFila = {
  tipo: 'todos' | 'empresa' | 'funcionario' | 'urgentes';
  obraId: string;
  busca: string;
};

function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Aplica tipo, obra e busca (fornecedor, obra ou documento, sem acento). */
export function filtrarFila(entradas: readonly EntradaFila[], filtros: FiltrosFila): EntradaFila[] {
  const termo = normalizar(filtros.busca.trim());
  return entradas.filter((e) => {
    if (filtros.tipo === 'empresa' && e.kind !== 'documento') return false;
    if (filtros.tipo === 'funcionario' && e.kind !== 'envio') return false;
    if (filtros.tipo === 'urgentes' && e.prioridade !== 'urgente') return false;
    if (filtros.obraId && e.obraPrincipal.id !== filtros.obraId) return false;
    if (!termo) return true;
    return [e.fornecedor.razaoSocial, e.obraPrincipal.nome, nomeDaEntrada(e), e.lista.nome].some((campo) =>
      normalizar(campo).includes(termo),
    );
  });
}

/** Um alvo da navegação: documento da empresa ou envio de arquivos. */
export type Alvo = { kind: 'documento' | 'envio'; id: string; pendente: boolean };

export function rotaDoAlvo(alvo: Alvo, origem: Origem): string {
  return alvo.kind === 'envio' ? paths.envio(alvo.id, origem) : paths.analise(alvo.id, origem);
}

/** Próximo alvo pendente depois do atual (e, se não houver, antes dele). */
export function proximoPendente(alvos: readonly Alvo[], atualId: string): Alvo | undefined {
  const i = alvos.findIndex((a) => a.id === atualId);
  const depois = alvos.slice(i + 1).find((a) => a.pendente);
  return depois ?? alvos.slice(0, Math.max(i, 0)).find((a) => a.pendente && a.id !== atualId);
}

/** Texto do toast quando não sobra nada pendente na origem. */
export function textoFim(origem: Origem, decisao: string): string {
  const t = strings.pages.analise.avanco;
  return origem.tipo === 'fila' ? t.fimFila(decisao) : origem.tipo === 'fornecedor' ? t.fimFornecedor(decisao) : t.fimObra(decisao);
}

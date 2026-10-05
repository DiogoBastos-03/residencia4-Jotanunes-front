import { baixarCsv, formatDate } from '@/shared/lib';
import { strings } from '@/shared/strings';
import type { Relatorio } from './types';

const t = strings.pages.relatorios;

/** As três seções do relatório num CSV só. */
export function exportarRelatorio(relatorio: Relatorio, hoje: string): void {
  baixarCsv(t.arquivo(hoje), [
    t.csv.pendencias,
    t.csv.pendenciasCabecalho,
    ...relatorio.pendencias.map((p) => [p.obra.nome, p.obra.codigo, p.total, p.fornecedores]),
    [],
    [`${t.csv.tempos[0] ?? ''} — ${t.periodos[relatorio.periodo]}`],
    t.csv.temposCabecalho,
    ...relatorio.tempos.map((x) => [x.lista.nome, strings.status[x.lista.tipo], x.diasMedios.toFixed(1).replace('.', ',')]),
    [],
    t.csv.vencimentos,
    t.csv.vencimentosCabecalho,
    ...relatorio.vencimentos.map((v) => [formatDate(v.validade, 'date'), v.documentoNome, v.fornecedor.razaoSocial, strings.dominio.faltam(v.diasRestantes)]),
  ]);
}

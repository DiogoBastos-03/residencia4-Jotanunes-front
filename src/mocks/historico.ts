import type { Analise, EventoHistorico, ObraLista, Obra, TempoAnalise, VinculoObra } from '@/entities';

/** Decisões de hoje: 8 análises — 6 aprovados e 2 reprovados. */
export const analises: readonly Analise[] = [
  { id: 'an-1420', quando: '2026-09-16T14:20', analista: 'Marina Duarte', documento: 'Cartão CNPJ', fornecedorId: 'marcenaria-sol-nascente', resultado: 'aprovado' },
  { id: 'an-1348', quando: '2026-09-16T13:48', analista: 'Rodrigo Alves', documento: 'ASO — Wellington Duarte', fornecedorId: 'construtora-exemplo', resultado: 'reprovado' },
  { id: 'an-1105', quando: '2026-09-16T11:05', analista: 'Camila Rocha', documento: 'Certidão de Registro no CREA', fornecedorId: 'engemax', resultado: 'aprovado' },
  { id: 'an-1032', quando: '2026-09-16T10:32', analista: 'Marina Duarte', documento: 'Contrato Social consolidado', fornecedorId: 'transportes-vale-verde', resultado: 'aprovado' },
  { id: 'an-0914', quando: '2026-09-16T09:14', analista: 'Rodrigo Alves', documento: 'Apólice de Seguro de Responsabilidade Civil', fornecedorId: 'pinturas-litoral', resultado: 'reprovado' },
  { id: 'an-0850', quando: '2026-09-16T08:50', analista: 'Camila Rocha', documento: 'Certidão Negativa de Débitos Federais', fornecedorId: 'cimentos-nordeste', resultado: 'aprovado' },
  { id: 'an-0831', quando: '2026-09-16T08:31', analista: 'Marina Duarte', documento: 'Cartão CNPJ', fornecedorId: 'gesso-forro-nordeste', resultado: 'aprovado' },
  { id: 'an-0805', quando: '2026-09-16T08:05', analista: 'Rodrigo Alves', documento: 'Comprovante de dados bancários', fornecedorId: 'marcenaria-sol-nascente', resultado: 'aprovado' },
];

/** Eventos registrados à mão — os do protótipo. */
const EVENTOS_REGISTRADOS: readonly EventoHistorico[] = [
  { id: 'ev-pgr', quando: '2026-09-14T08:42', autor: { kind: 'fornecedor', fornecedorId: 'construtora-exemplo' }, acao: { tipo: 'documentoEnviado', documento: 'PGR – Programa de Gerenciamento de Riscos' }, obraId: 'ob-2401', fornecedorId: 'construtora-exemplo' },
  { id: 'ev-aso-wellington', quando: '2026-09-16T13:48', autor: { kind: 'pessoa', nome: 'Rodrigo Alves' }, acao: { tipo: 'documentoReprovado', documento: 'ASO de Wellington Duarte', motivo: 'ilegivel' }, fornecedorId: 'construtora-exemplo' },
  { id: 'ev-remessa', quando: '2026-09-11T14:03', autor: { kind: 'fornecedor', fornecedorId: 'construtora-exemplo' }, acao: { tipo: 'remessaEnviada', funcionarios: 8, obraId: 'ob-2401' }, obraId: 'ob-2401', fornecedorId: 'construtora-exemplo' },
  { id: 'ev-fgts-vencido', quando: '2026-09-10T00:00', autor: { kind: 'sistema' }, acao: { tipo: 'documentoVencido', documento: 'Certidão de Regularidade do FGTS', fornecedorId: 'construtora-exemplo' }, obraId: 'ob-2401', fornecedorId: 'construtora-exemplo' },
  { id: 'ev-cnd-aprovada', quando: '2026-08-25T10:44', autor: { kind: 'pessoa', nome: 'Marina Duarte' }, acao: { tipo: 'documentoAprovado', documento: 'Certidão Negativa de Débitos Federais' }, fornecedorId: 'construtora-exemplo' },
];

/** Quem vinculou, quando o protótipo diz. */
const AUTOR_VINCULO: Record<string, string> = {
  'construtora-exemplo|ob-2401': 'Camila Rocha',
  'construtora-exemplo|ob-2402': 'Camila Rocha',
  'serralheria-ponto-firme|ob-2401': 'Marina Duarte',
};

const ANALISTA_POR_ANO: Record<string, string> = { '2023': 'Camila Rocha', '2024': 'Camila Rocha', '2025': 'Marina Duarte', '2026': 'Camila Rocha' };

/**
 * Eventos derivados dos próprios dados: obra recebida da integração,
 * listas vinculadas e fornecedores vinculados. Assim o histórico de qualquer
 * obra ou fornecedor bate com o que as outras telas mostram.
 */
export function montarEventos(
  obras: readonly Obra[],
  obraListas: readonly ObraLista[],
  vinculos: readonly VinculoObra[],
): EventoHistorico[] {
  const eventos: EventoHistorico[] = [...EVENTOS_REGISTRADOS];

  for (const obra of obras) {
    eventos.push({ id: `ev-obra-${obra.id}`, quando: obra.recebidaEm, autor: { kind: 'integracao' }, acao: { tipo: 'obraRecebida', obraId: obra.id }, obraId: obra.id });
  }

  const porMomento = new Map<string, ObraLista[]>();
  for (const ol of obraListas) {
    const chave = `${ol.obraId}|${ol.vinculadaEm}`;
    porMomento.set(chave, [...(porMomento.get(chave) ?? []), ol]);
  }
  for (const [chave, grupo] of porMomento) {
    const primeiro = grupo[0];
    if (!primeiro) continue;
    eventos.push({
      id: `ev-listas-${chave}`,
      quando: primeiro.vinculadaEm,
      autor: { kind: 'pessoa', nome: ANALISTA_POR_ANO[primeiro.vinculadaEm.slice(0, 4)] ?? 'Camila Rocha' },
      acao: { tipo: 'listasVinculadas', listaIds: grupo.map((g) => g.listaId), obraId: primeiro.obraId },
      obraId: primeiro.obraId,
    });
  }

  vinculos.forEach((v, i) => {
    eventos.push({
      id: `ev-vinculo-${v.fornecedorId}-${v.obraId}`,
      quando: v.vinculadoEm,
      autor: { kind: 'pessoa', nome: AUTOR_VINCULO[`${v.fornecedorId}|${v.obraId}`] ?? (i % 2 === 0 ? 'Marina Duarte' : 'Camila Rocha') },
      acao: { tipo: 'fornecedorVinculado', fornecedorId: v.fornecedorId, obraId: v.obraId },
      obraId: v.obraId,
      fornecedorId: v.fornecedorId,
    });
  });

  return eventos.sort((a, b) => b.quando.localeCompare(a.quando));
}

export const temposAnalise: readonly TempoAnalise[] = [
  { listaId: 'hab-servico', diasMedios: 1.2, acimaDaMeta: false },
  { listaId: 'seg-trabalho', diasMedios: 2.8, acimaDaMeta: true },
  { listaId: 'hab-material', diasMedios: 0.9, acimaDaMeta: false },
  { listaId: 'obras-publicas', diasMedios: 1.6, acimaDaMeta: false },
];

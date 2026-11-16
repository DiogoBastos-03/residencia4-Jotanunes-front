import { dominio } from '../dominio';

/** Painel de pendências (/pendencias). Contagens calculadas pelo back na hora da consulta. */
export const pendenciasPage = {
  title: 'Pendências',
  subtitle: 'Exigências de cada fornecedor nas obras em que está, pela situação do envio mais recente de cada documento.',
  totais: { pendentes: 'Pendentes', aVencer: 'A vencer em 30 dias', vencidas: 'Vencidas', postergadas: 'Postergadas' },
  totaisHint: (n: number) => `em ${dominio.fornecedores(n)}`,
  caption: 'Pendências por fornecedor',
  colunas: { fornecedor: 'Fornecedor', pendentes: 'Pendentes', aVencer: 'A vencer', vencidas: 'Vencidas', postergadas: 'Postergadas' },
  abrir: 'Abrir ficha',
  nota: 'Pendente: nunca enviada ou com o último envio não aprovado. A vencer: aprovada, vence em até 30 dias. Postergada: com prazo extra ativo.',
  vazioTitle: 'Nenhuma exigência em aberto',
  vazioDescription: 'Os fornecedores com lista de exigências nas suas obras aparecem aqui quando houver algo pendente, a vencer, vencido ou postergado.',
} as const;

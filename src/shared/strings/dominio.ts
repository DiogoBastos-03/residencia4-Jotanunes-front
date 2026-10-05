/**
 * Vocabulário do produto usado em várias telas. Trocar "lista de exigências"
 * por outro termo é editar aqui.
 */
const plural = (n: number, um: string, varios: string) => (n === 1 ? `1 ${um}` : `${n} ${varios}`);

export const dominio = {
  plural,
  usuarioAtual: 'Você',
  lista: 'Lista de exigências',
  listaCurta: 'Lista',
  listas: (n: number) => plural(n, 'lista', 'listas'),
  itemExigido: 'Item exigido',
  documentoEmpresa: 'Documento da empresa',
  documentoFuncionario: 'Documento de funcionário',
  escopo: { empresa: 'Documento da empresa', funcionario: 'Documento de funcionário' },
  arquivos: (n: number) => plural(n, 'arquivo', 'arquivos'),
  espera: (dias: number) => (dias <= 0 ? 'hoje' : plural(dias, 'dia', 'dias')),
  esperaCurta: (dias: number) => (dias <= 0 ? 'chegou hoje' : `espera ${plural(dias, 'dia', 'dias')}`),
  emAberto: (dias: number) => (dias <= 0 ? 'desde hoje' : `há ${plural(dias, 'dia', 'dias')}`),
  faltam: (dias: number) => (dias < 0 ? `venceu há ${plural(-dias, 'dia', 'dias')}` : dias === 0 ? 'vence hoje' : plural(dias, 'dia', 'dias')),
  obrasExtras: (n: number) => (n > 0 ? `+${n}` : ''),
  documentosDe: (feitos: number, total: number) => `${feitos} de ${total}`,
  cidadeUf: (cidade: string, uf: string) => `${cidade}/${uf}`,
  tipo: { servico: 'serviço', material: 'material' },
  composicao: (obrigatorios: number, opcionais: number, funcionario: number) =>
    [
      plural(obrigatorios, 'documento', 'documentos'),
      opcionais > 0 ? plural(opcionais, 'opcional', 'opcionais') : '',
      funcionario > 0 ? `${funcionario} de funcionário` : '',
    ]
      .filter(Boolean)
      .join(' • '),
  fornecedores: (n: number) => plural(n, 'fornecedor', 'fornecedores'),
  obras: (n: number) => plural(n, 'obra', 'obras'),
  pendencias: (n: number) => plural(n, 'pendência', 'pendências'),
  tamanhoArquivo: (kb: number) => (kb >= 1000 ? `${(kb / 1000).toFixed(1).replace('.', ',')} MB` : `${kb} KB`),
  motivos: {
    ilegivel: 'Documento ilegível',
    foraValidade: 'Fora da validade',
    incorreto: 'Documento incorreto',
    faltaAssinatura: 'Falta assinatura',
  },
  /** Resumo de um documento de funcionário: nunca fica completo, é um retrato dos arquivos. */
  resumoArquivos: (r: { total: number; aprovados: number; emAnalise: number; reprovados: number; vencidos: number }) =>
    r.total === 0
      ? 'nenhum arquivo enviado'
      : [
          `${r.aprovados} de ${r.total} aprovados`,
          r.emAnalise > 0 ? `${r.emAnalise} em análise` : '',
          r.reprovados > 0 ? plural(r.reprovados, 'reprovado', 'reprovados') : '',
          r.vencidos > 0 ? plural(r.vencidos, 'vencido', 'vencidos') : '',
        ]
          .filter(Boolean)
          .join(' • '),
  /** "PGR – Programa de…" → "PGR"; nomes sem sigla ficam inteiros. */
  nomeCurto: (nome: string) => nome.split(' – ')[0] ?? nome,
} as const;

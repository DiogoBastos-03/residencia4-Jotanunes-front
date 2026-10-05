import { dominio } from '../dominio';

/** Obras (/obras). */
export const obrasPage = {
  title: 'Obras',
  subtitle: 'A obra liga as listas de exigências aos fornecedores que trabalham nela',
  origem: 'Obras recebidas da integração. Não são criadas aqui.',
  caption: 'Obras recebidas da integração',
  colunas: {
    obra: 'Obra',
    codigo: 'Código',
    cidade: 'Cidade',
    listas: 'Listas de exigências',
    fornecedores: 'Fornecedores',
    pendencias: 'Pendências',
    situacao: 'Situação',
  },
  acao: 'Abrir obra',
  vaziaTitle: 'Nenhuma obra recebida ainda',
  vaziaDescription:
    'As obras chegam pela integração com o sistema de obras da JotaNunes. Assim que a primeira for enviada, ela aparece aqui para você vincular listas de exigências e fornecedores.',
  resumo: (total: number, semLista: number) =>
    semLista === 0 ? dominio.obras(total) : `${dominio.obras(total)} • ${dominio.plural(semLista, 'sem lista de exigências', 'sem lista de exigências')}`,
} as const;

import { dominio } from '../dominio';

/** Ficha da obra (/obras/:id). */
export const obraPage = {
  voltar: 'Obras',
  recebida: (data: string) => `recebida da integração em ${data}`,
  vincularFornecedor: 'Vincular fornecedor',
  metricas: { listas: 'Listas de exigências', fornecedores: 'Fornecedores', pendencias: 'Pendências' },
  abasLabel: 'Seções da obra',
  abas: { fornecedores: 'Fornecedores', exigencias: 'Exigências', pendencias: 'Pendências', historico: 'Histórico' },
  naoEncontradaTitle: 'Obra não encontrada',
  naoEncontradaDescription: 'O endereço pode estar incorreto ou a obra saiu da integração. Volte para a lista de obras.',
  naoEncontradaAction: 'Ver todas as obras',
  fornecedores: {
    caption: 'Fornecedores da obra',
    colunas: {
      fornecedor: 'Fornecedor',
      tipo: 'Tipo',
      servico: 'Serviço contratado',
      periodo: 'Período',
      listas: 'Listas aplicáveis',
      documentos: 'Documentos',
      situacao: 'Situação',
    },
    periodo: (inicio: string, fim: string) => `${inicio} – ${fim}`,
    acao: 'Abrir ficha',
    nota: 'Um fornecedor só recebe as exigências das listas do mesmo tipo dele. As demais são ignoradas.',
    vazioTitle: 'Nenhum fornecedor nesta obra',
    vazioDescription: 'Vincule os fornecedores contratados. Cada um passa a receber as exigências das listas do mesmo tipo que valem aqui.',
  },
  exigencias: {
    resumo: (total: number, servico: number, material: number) =>
      `${dominio.listas(total)} nesta obra • ${servico} de serviço • ${material} de material`,
    vincular: 'Vincular lista de exigências',
    caption: 'Listas de exigências da obra',
    colunas: { lista: 'Lista de exigências', tipo: 'Tipo', itens: 'Itens exigidos', aplica: 'Aplica-se a', vinculada: 'Vinculada em' },
    aplica: (n: number, total: number) => `${n} de ${dominio.fornecedores(total)} desta obra`,
    desvincular: 'Desvincular',
    nota:
      'Cada lista vale para os fornecedores do mesmo tipo. Uma lista de material não cria exigência para um fornecedor de serviço — ela é simplesmente ignorada. Toda obra precisa de pelo menos uma lista de exigências, então a última não pode ser desvinculada.',
    ultimaNota: 'Esta é a única lista desta obra. Para trocar, vincule outra antes de desvincular esta.',
    vazioTitle: 'Esta obra ainda não tem lista de exigências',
    vazioDescription:
      'Sem lista, os fornecedores desta obra não recebem nenhuma pendência. Vincule pelo menos uma lista — toda obra precisa de uma.',
  },
  pendencias: {
    intro:
      'Pendência não trava ninguém: o fornecedor pode pular item, pular prazo ou não enviar nada. O que falta fica aqui e entra na cobrança.',
    contagem: (n: number) => dominio.pendencias(n),
    caption: (fornecedor: string) => `Pendências de ${fornecedor}`,
    colunas: { pendencia: 'Pendência', tipo: 'Tipo', exigidoPor: 'Exigido por', situacao: 'Situação', emAberto: 'Em aberto' },
    arquivos: (semArquivos: boolean, reprovados: number, vencidos: number) =>
      semArquivos
        ? 'nenhum arquivo enviado'
        : [reprovados > 0 ? dominio.plural(reprovados, 'arquivo reprovado', 'arquivos reprovados') : '', vencidos > 0 ? dominio.plural(vencidos, 'arquivo vencido', 'arquivos vencidos') : '']
            .filter(Boolean)
            .join(' • '),
    ver: 'Ver',
    vazioTitle: 'Nenhuma pendência nesta obra',
    vazioDescription: 'Todos os fornecedores estão com os documentos exigidos aprovados e dentro da validade.',
  },
  historico: {
    vazioTitle: 'Nada registrado ainda',
    vazioDescription: 'Vínculos, envios e decisões sobre esta obra aparecem aqui.',
  },
  drawerFornecedor: {
    title: 'Vincular fornecedor',
    subtitle: (obra: string, codigo: string) => `${obra} • ${codigo}`,
    fornecedor: 'Fornecedor',
    servico: 'Serviço contratado',
    servicoPlaceholder: 'Ex.: Vergalhões e telas',
    servicoErro: 'Diga o que foi contratado.',
    inicio: 'Início',
    fim: 'Fim previsto',
    mesPlaceholder: 'mm/aaaa',
    periodoErro: 'Use mm/aaaa, com o fim depois do início.',
    listas: 'Listas exigidas nesta obra',
    vaiSeAplicar: 'Vai se aplicar',
    naoSeAplica: (tipo: string) => `Não se aplica — tipo ${tipo}`,
    calculado: 'Calculado pelo tipo do fornecedor. Não é preciso escolher.',
    semListas: 'Esta obra ainda não tem lista de exigências: o fornecedor não recebe nenhuma pendência por enquanto.',
    resumo: 'Resumo',
    resumoTexto: (fornecedor: string, tipo: string, aplicam: string[], total: number, outroTipo: string, ignoradas: number) => {
      const base = `${fornecedor} é fornecedor de ${tipo}.`;
      if (total === 0) return `${base} Esta obra ainda não tem lista de exigências.`;
      const aplica =
        aplicam.length === 0
          ? ` Nenhuma das ${total} listas desta obra se aplica a ele.`
          : ` Nesta obra, ${aplicam.length} de ${dominio.listas(total)} ${aplicam.length === 1 ? 'se aplica' : 'se aplicam'} a ele: ${aplicam.join(' e ')}.`;
      const ignora =
        ignoradas === 0 ? '' : ignoradas === 1 ? ` A outra é de ${outroTipo} e será ignorada.` : ` As outras ${ignoradas} são de ${outroTipo} e serão ignoradas.`;
      return `${base}${aplica}${ignora}`;
    },
    limpar: 'Limpar campos',
    cancelar: 'Cancelar',
    confirmar: 'Vincular fornecedor',
    toast: 'Fornecedor vinculado à obra e avisado',
    todosVinculadosTitle: 'Todos os fornecedores já estão nesta obra',
    todosVinculadosDescription: 'Cadastre um fornecedor novo em Fornecedores para poder vinculá-lo aqui.',
  },
  drawerLista: {
    title: 'Vincular lista de exigências',
    subtitle: (obra: string, codigo: string) => `${obra} • ${codigo}`,
    buscaLabel: 'Buscar lista de exigências',
    buscaPlaceholder: 'Buscar lista de exigências',
    ativas: 'Listas ativas',
    jaNestaObra: 'Já nesta obra',
    semResultado: 'Nenhuma lista com esse nome.',
    resumo: 'Resumo',
    nenhuma: 'Nenhuma lista selecionada.',
    resumoTexto: (listas: number, fornecedores: number, tipos: string, docs: number) =>
      `${dominio.plural(listas, 'lista selecionada', 'listas selecionadas')} • passa a valer para ${dominio.fornecedores(fornecedores)} de ${tipos} desta obra • ${dominio.plural(docs, 'documento novo', 'documentos novos')}.`,
    nota: 'As exigências aparecem como pendentes no portal dos fornecedores do mesmo tipo. Quem já enviou o documento em outra obra não precisa enviar de novo.',
    limpar: 'Limpar seleção',
    cancelar: 'Cancelar',
    confirmar: (n: number) => (n <= 1 ? 'Vincular lista' : `Vincular ${n} listas`),
    toast: (n: number) => (n === 1 ? 'Lista de exigências vinculada à obra' : 'Listas de exigências vinculadas à obra'),
  },
  modalDesvincular: {
    title: 'Desvincular lista de exigências?',
    texto: (lista: string, obra: string, fornecedores: number, tipo: string) =>
      fornecedores === 0
        ? `${lista} deixa de valer em ${obra}. Nenhum fornecedor de ${tipo} desta obra é afetado.`
        : `${lista} deixa de valer em ${obra}. ${fornecedores === 1 ? 'O fornecedor' : `Os ${fornecedores} fornecedores`} de ${tipo} desta obra ${fornecedores === 1 ? 'para' : 'param'} de receber estas exigências.`,
    nota: 'Os documentos já enviados continuam no histórico. Toda obra precisa de pelo menos uma lista de exigências, então a última não pode ser desvinculada.',
    cancelar: 'Cancelar',
    confirmar: 'Desvincular',
    toast: 'Lista de exigências desvinculada da obra',
  },
} as const;

import type { DecisaoRegistrada, DocumentoEmpresa, DocumentoExigido, Fornecedor } from '@/entities';

type Explicito = Omit<DocumentoEmpresa, 'id' | 'enviosAnteriores'> & {
  enviosAnteriores?: DocumentoEmpresa['enviosAnteriores'];
};

/**
 * Documentos com situação específica, vindos do protótipo. O restante é
 * gerado como aprovado e dentro da validade (fornecedores aptos).
 */
const EXPLICITOS: readonly Explicito[] = [
  // Construtora Exemplo — 5 de 9 obrigatórios em dia
  { fornecedorId: 'construtora-exemplo', tipoDocumentoId: 'contrato-social', status: 'aprovado', arquivo: 'contrato-social-construtora-exemplo.pdf', tamanhoKb: 2140, enviadoEm: '2026-01-10T09:12' },
  { fornecedorId: 'construtora-exemplo', tipoDocumentoId: 'cartao-cnpj', status: 'aprovado', arquivo: 'cartao-cnpj-construtora-exemplo.pdf', tamanhoKb: 180, enviadoEm: '2026-01-10T09:14' },
  { fornecedorId: 'construtora-exemplo', tipoDocumentoId: 'cnd-federal', status: 'aprovado', validade: '2027-03-12', arquivo: 'cnd-federal-2026-08.pdf', tamanhoKb: 210, enviadoEm: '2026-08-25T10:02', decisao: { por: 'Marina Duarte', em: '2026-08-25T10:44' } },
  { fornecedorId: 'construtora-exemplo', tipoDocumentoId: 'fgts', status: 'aprovado', validade: '2026-09-10', arquivo: 'crf-fgts-2026-03.pdf', tamanhoKb: 160, enviadoEm: '2026-03-12T15:30' },
  { fornecedorId: 'construtora-exemplo', tipoDocumentoId: 'cndt', status: 'aprovado', validade: '2026-09-28', arquivo: 'cndt-2026-04.pdf', tamanhoKb: 150, enviadoEm: '2026-04-01T11:48' },
  { fornecedorId: 'construtora-exemplo', tipoDocumentoId: 'atestado-capacidade', status: 'aprovado', arquivo: 'atestado-capacidade-tecnica.pdf', tamanhoKb: 940, enviadoEm: '2026-02-18T16:05' },
  {
    fornecedorId: 'construtora-exemplo',
    tipoDocumentoId: 'pgr',
    status: 'emAnalise',
    arquivo: 'pgr-2026-construtora-exemplo.pdf',
    tamanhoKb: 1843,
    paginas: 12,
    validadeInformada: '2027-09-30',
    enviadoEm: '2026-09-14T08:42',
    prioridade: 'urgente',
    enviosAnteriores: [
      { arquivo: 'pgr-2026-v1.pdf', enviadoEm: '2026-09-04', resultado: 'reprovado' },
      { arquivo: 'pgr-2025.pdf', enviadoEm: '2025-03-12', resultado: 'aprovado' },
    ],
  },
  { fornecedorId: 'construtora-exemplo', tipoDocumentoId: 'pcmso', status: 'pendente', pendenteDesde: '2026-09-02' },
  { fornecedorId: 'construtora-exemplo', tipoDocumentoId: 'apolice-rc', status: 'emAnalise', arquivo: 'apolice-rc-2026.pdf', tamanhoKb: 1310, paginas: 8, validadeInformada: '2027-09-14', enviadoEm: '2026-09-15T10:12', prioridade: 'normal' },
  { fornecedorId: 'construtora-exemplo', tipoDocumentoId: 'crea', status: 'aprovado', validade: '2027-06-30', arquivo: 'certidao-crea-construtora.pdf', tamanhoKb: 230, enviadoEm: '2026-01-20T14:10' },

  // Elétrica Aracaju — 8 de 9; duas renovações em análise
  { fornecedorId: 'eletrica-aracaju', tipoDocumentoId: 'cnd-federal', status: 'aprovado', validade: '2026-10-02', arquivo: 'cnd-federal-eletrica.pdf', tamanhoKb: 205, enviadoEm: '2026-04-04T09:20' },
  {
    fornecedorId: 'eletrica-aracaju',
    tipoDocumentoId: 'fgts',
    status: 'aprovado',
    validade: '2026-10-16',
    arquivo: 'crf-fgts-eletrica-2026-04.pdf',
    tamanhoKb: 158,
    enviadoEm: '2026-04-16T10:00',
    renovacao: { arquivo: 'crf-fgts-eletrica-2026-09.pdf', tamanhoKb: 162, paginas: 1, validadeInformada: '2026-10-12', enviadoEm: '2026-09-13T16:20', prioridade: 'normal' },
    enviosAnteriores: [{ arquivo: 'crf-fgts-eletrica-2026-04.pdf', enviadoEm: '2026-04-16', resultado: 'aprovado' }],
  },
  { fornecedorId: 'eletrica-aracaju', tipoDocumentoId: 'cndt', status: 'pendente', pendenteDesde: '2026-09-13' },
  {
    fornecedorId: 'eletrica-aracaju',
    tipoDocumentoId: 'apolice-rc',
    status: 'aprovado',
    validade: '2027-01-20',
    arquivo: 'apolice-rc-eletrica-2026.pdf',
    tamanhoKb: 1210,
    enviadoEm: '2026-01-21T08:50',
    renovacao: { arquivo: 'apolice-rc-eletrica-endosso.pdf', tamanhoKb: 640, paginas: 4, validadeInformada: '2027-01-20', enviadoEm: '2026-09-15T09:05', prioridade: 'normal' },
    enviosAnteriores: [{ arquivo: 'apolice-rc-eletrica-2026.pdf', enviadoEm: '2026-01-21', resultado: 'aprovado' }],
  },

  // Engemax — apta; apólice vence em breve, PCMSO renovado em análise
  { fornecedorId: 'engemax', tipoDocumentoId: 'apolice-rc', status: 'aprovado', validade: '2026-10-09', arquivo: 'apolice-rc-engemax.pdf', tamanhoKb: 1180, enviadoEm: '2025-10-09T13:15' },
  {
    fornecedorId: 'engemax',
    tipoDocumentoId: 'pcmso',
    status: 'aprovado',
    validade: '2026-10-16',
    arquivo: 'pcmso-engemax-2025.pdf',
    tamanhoKb: 2030,
    enviadoEm: '2025-10-16T10:40',
    renovacao: { arquivo: 'pcmso-engemax-2026.pdf', tamanhoKb: 2210, paginas: 18, validadeInformada: '2027-09-15', enviadoEm: '2026-09-15T11:30', prioridade: 'normal' },
    enviosAnteriores: [{ arquivo: 'pcmso-engemax-2025.pdf', enviadoEm: '2025-10-16', resultado: 'aprovado' }],
  },
  { fornecedorId: 'engemax', tipoDocumentoId: 'crea', status: 'aprovado', validade: '2027-09-16', arquivo: 'certidao-crea-engemax.pdf', tamanhoKb: 240, enviadoEm: '2026-09-14T17:02', decisao: { por: 'Camila Rocha', em: '2026-09-16T11:05' } },

  // Hidro Norte — contrato social em análise, urgente
  { fornecedorId: 'hidro-norte', tipoDocumentoId: 'contrato-social', status: 'emAnalise', arquivo: 'contrato-social-hidro-norte.pdf', tamanhoKb: 2480, paginas: 14, enviadoEm: '2026-09-14T15:48', prioridade: 'urgente' },

  // Serralheria Ponto Firme — apta; renovação da CND federal em análise
  {
    fornecedorId: 'serralheria-ponto-firme',
    tipoDocumentoId: 'cnd-federal',
    status: 'aprovado',
    validade: '2026-10-16',
    arquivo: 'cnd-federal-ponto-firme-2026-04.pdf',
    tamanhoKb: 198,
    enviadoEm: '2026-04-17T09:00',
    renovacao: { arquivo: 'cnd-federal-ponto-firme-2026-09.pdf', tamanhoKb: 201, paginas: 1, validadeInformada: '2027-03-14', enviadoEm: '2026-09-15T14:02', prioridade: 'normal' },
    enviosAnteriores: [{ arquivo: 'cnd-federal-ponto-firme-2026-04.pdf', enviadoEm: '2026-04-17', resultado: 'aprovado' }],
  },

  // Transportes Vale Verde — apta; FGTS vence em breve
  { fornecedorId: 'transportes-vale-verde', tipoDocumentoId: 'fgts', status: 'aprovado', validade: '2026-10-14', arquivo: 'crf-fgts-vale-verde.pdf', tamanhoKb: 155, enviadoEm: '2026-04-14T08:30' },
  { fornecedorId: 'transportes-vale-verde', tipoDocumentoId: 'contrato-social', status: 'aprovado', arquivo: 'contrato-social-vale-verde.pdf', tamanhoKb: 2310, enviadoEm: '2026-09-12T11:25' },

  // Marcenaria Sol Nascente — aprovações de hoje
  { fornecedorId: 'marcenaria-sol-nascente', tipoDocumentoId: 'cartao-cnpj', status: 'aprovado', arquivo: 'cartao-cnpj-sol-nascente.pdf', tamanhoKb: 176, enviadoEm: '2026-09-15T17:40' },
  { fornecedorId: 'marcenaria-sol-nascente', tipoDocumentoId: 'dados-bancarios', status: 'aprovado', validade: '2027-09-15', arquivo: 'dados-bancarios-sol-nascente.pdf', tamanhoKb: 96, enviadoEm: '2026-09-15T17:42' },

  // Aços do Recife — 8 de 10
  { fornecedorId: 'acos-do-recife', tipoDocumentoId: 'dados-bancarios', status: 'pendente', pendenteDesde: '2026-08-26' },
  { fornecedorId: 'acos-do-recife', tipoDocumentoId: 'cnd-municipal', status: 'emAnalise', arquivo: 'cnd-municipal-acos-recife.pdf', tamanhoKb: 188, paginas: 1, validadeInformada: '2026-12-13', enviadoEm: '2026-09-14T11:20', prioridade: 'normal' },

  // Cimentos Nordeste — apta; dados bancários vencem em breve
  { fornecedorId: 'cimentos-nordeste', tipoDocumentoId: 'dados-bancarios', status: 'aprovado', validade: '2026-10-16', arquivo: 'dados-bancarios-cimentos-ne.pdf', tamanhoKb: 102, enviadoEm: '2025-10-16T10:10' },
  { fornecedorId: 'cimentos-nordeste', tipoDocumentoId: 'cnd-federal', status: 'aprovado', validade: '2027-03-15', arquivo: 'cnd-federal-cimentos-ne.pdf', tamanhoKb: 207, enviadoEm: '2026-09-15T16:18' },

  // Pinturas Litoral — bloqueada, 4 de 9
  {
    fornecedorId: 'pinturas-litoral',
    tipoDocumentoId: 'fgts',
    status: 'reprovado',
    arquivo: 'fgts-pinturas-litoral.jpg',
    tamanhoKb: 820,
    enviadoEm: '2026-08-19T10:00',
    pendenteDesde: '2026-08-20',
    decisao: { por: 'Marina Duarte', em: '2026-08-20T11:02', motivo: 'foraValidade', observacao: 'A certidão enviada venceu em julho. Emita uma nova no site da Caixa e envie de novo.' },
  },
  { fornecedorId: 'pinturas-litoral', tipoDocumentoId: 'pgr', status: 'pendente', pendenteDesde: '2026-07-15' },
  { fornecedorId: 'pinturas-litoral', tipoDocumentoId: 'pcmso', status: 'pendente', pendenteDesde: '2026-07-15' },
  {
    fornecedorId: 'pinturas-litoral',
    tipoDocumentoId: 'apolice-rc',
    status: 'reprovado',
    arquivo: 'apolice-pinturas-litoral.pdf',
    tamanhoKb: 990,
    enviadoEm: '2026-09-15T18:20',
    pendenteDesde: '2026-09-16',
    decisao: { por: 'Rodrigo Alves', em: '2026-09-16T09:14', motivo: 'incorreto', observacao: 'Foi enviada a apólice de outra empresa. Envie a apólice em nome da Pinturas Litoral.' },
  },
  { fornecedorId: 'pinturas-litoral', tipoDocumentoId: 'crea', status: 'pendente', pendenteDesde: '2026-07-15' },

  // Gesso & Forro Nordeste — apta; CNDT vence em breve
  { fornecedorId: 'gesso-forro-nordeste', tipoDocumentoId: 'cndt', status: 'aprovado', validade: '2026-10-16', arquivo: 'cndt-gesso-forro.pdf', tamanhoKb: 149, enviadoEm: '2026-04-16T09:45' },
  { fornecedorId: 'gesso-forro-nordeste', tipoDocumentoId: 'cartao-cnpj', status: 'aprovado', arquivo: 'cartao-cnpj-gesso-forro.pdf', tamanhoKb: 171, enviadoEm: '2026-09-15T15:12' },

  // Impermeabilizadora Capibaribe — recém-chegada, PGR em análise
  { fornecedorId: 'impermeabilizadora-capibaribe', tipoDocumentoId: 'pgr', status: 'emAnalise', arquivo: 'pgr-impercapibaribe.pdf', tamanhoKb: 1560, paginas: 10, validadeInformada: '2027-08-31', enviadoEm: '2026-09-12T09:30', prioridade: 'normal' },

  // Cerâmica Vale do Ipojuca — CND federal ainda não enviada
  { fornecedorId: 'ceramica-vale-ipojuca', tipoDocumentoId: 'cnd-federal', status: 'pendente', pendenteDesde: '2026-09-01' },
];

const VALIDADES = ['2027-01-18', '2027-02-26', '2027-03-31', '2027-04-22', '2027-05-14', '2027-06-09', '2027-07-21', '2027-08-12', '2026-12-04', '2026-11-27'];

function slug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Documento aprovado e válido, para os itens sem situação específica. */
function gerarPadrao(fornecedor: Fornecedor, exigido: DocumentoExigido, indice: number): DocumentoEmpresa | null {
  // Opcionais: metade dos fornecedores não envia — e tudo bem, não vira pendência.
  if (exigido.obrigatoriedade === 'opcional' && indice % 2 === 1) return null;
  const desde = fornecedor.desde.slice(0, 10);
  return {
    id: `doc-${fornecedor.id}-${exigido.tipoDocumentoId}`,
    fornecedorId: fornecedor.id,
    tipoDocumentoId: exigido.tipoDocumentoId,
    status: 'aprovado',
    validade: exigido.item.validade === 'comData' ? VALIDADES[indice % VALIDADES.length] : undefined,
    arquivo: `${exigido.tipoDocumentoId}-${slug(fornecedor.razaoSocial)}.pdf`,
    tamanhoKb: 120 + ((indice * 97) % 1900),
    enviadoEm: `${desde}T${String(8 + (indice % 9)).padStart(2, '0')}:${String((indice * 7) % 60).padStart(2, '0')}`,
    enviosAnteriores: [],
  };
}

const ANALISTAS = ['Marina Duarte', 'Rodrigo Alves', 'Camila Rocha'] as const;

/** Quem decidiu e quando, para documentos aprovados que não trazem a decisão explícita. */
function decisaoPadrao(doc: DocumentoEmpresa, indice: number): DecisaoRegistrada | undefined {
  if (doc.decisao || doc.status !== 'aprovado' || !doc.enviadoEm) return doc.decisao;
  const d = new Date(`${doc.enviadoEm.slice(0, 10)}T12:00:00`);
  d.setDate(d.getDate() + 1);
  const dia = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { por: ANALISTAS[indice % ANALISTAS.length] ?? 'Marina Duarte', em: `${dia}T${String(9 + (indice % 8)).padStart(2, '0')}:${String((indice * 11) % 60).padStart(2, '0')}` };
}

/** Monta todos os documentos: os explícitos e, para o resto do que é exigido, os padrões. */
export function montarDocumentos(
  fornecedores: readonly Fornecedor[],
  exigidosDe: (fornecedorId: string) => DocumentoExigido[],
): DocumentoEmpresa[] {
  const documentos: DocumentoEmpresa[] = [];
  fornecedores.forEach((fornecedor, fi) => {
    exigidosDe(fornecedor.id)
      .filter((exigido) => exigido.escopo === 'empresa')
      .forEach((exigido, di) => {
      const explicito = EXPLICITOS.find(
        (e) => e.fornecedorId === fornecedor.id && e.tipoDocumentoId === exigido.tipoDocumentoId,
      );
      if (explicito) {
        const doc: DocumentoEmpresa = {
          ...explicito,
          id: `doc-${fornecedor.id}-${exigido.tipoDocumentoId}`,
          enviosAnteriores: explicito.enviosAnteriores ?? [],
        };
        documentos.push({ ...doc, decisao: decisaoPadrao(doc, fi + di) });
        return;
      }
      const padrao = gerarPadrao(fornecedor, exigido, fi + di);
      if (padrao) documentos.push({ ...padrao, decisao: decisaoPadrao(padrao, fi + di) });
    });
  });
  return documentos;
}

/** Explícitos que não casam com nenhuma exigência — usado para conferir os mocks. */
export function explicitosOrfaos(exigidosDe: (fornecedorId: string) => DocumentoExigido[]): string[] {
  return EXPLICITOS.filter(
    (e) => !exigidosDe(e.fornecedorId).some((x) => x.escopo === 'empresa' && x.tipoDocumentoId === e.tipoDocumentoId),
  ).map((e) => `${e.fornecedorId}/${e.tipoDocumentoId}`);
}

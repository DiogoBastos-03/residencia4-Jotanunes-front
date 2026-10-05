import {
  documentosExigidos,
  nomeDoTipoDocumento,
  somarDias,
  type Analise,
  type ArquivoFuncionario,
  type Dataset,
  type DecisaoRegistrada,
  type DocumentoEmpresa,
  type DocumentoExigido,
  type EnvioArquivos,
  type EventoHistorico,
  type Fornecedor,
  type IsoDate,
  type MotivoReprovacao,
  type Obra,
  type ObraLista,
  type VinculoObra,
} from '@/entities';
import { PESSOAS } from './arquivos';

/**
 * Dados de demonstração construídos sobre fornecedores e obras reais (da API).
 * Tudo aqui é função pura: a "sorte" vem de um hash do id, nunca de Math.random —
 * o mesmo id gera sempre o mesmo resultado, e recarregar a página não muda a tela.
 * Só as datas acompanham o "hoje" do navegador, para que validades e esperas façam sentido.
 */

const ANALISTAS = ['Marina Duarte', 'Rodrigo Alves', 'Camila Rocha'] as const;
const MOTIVOS = ['ilegivel', 'foraValidade', 'incorreto', 'faltaAssinatura'] as const;
const OBSERVACOES: Record<MotivoReprovacao, string> = {
  ilegivel: 'O arquivo está cortado ou ilegível. Envie de novo, inteiro e legível.',
  foraValidade: 'A certidão enviada já estava vencida. Emita uma nova e envie de novo.',
  incorreto: 'O documento enviado não é o pedido. Confira o item e envie o documento correto.',
  faltaAssinatura: 'Falta a assinatura do responsável. Envie o documento assinado.',
};

/** FNV-1a de 32 bits: estável entre navegadores e recargas. */
function hash(texto: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

const sorteio = (...partes: string[]) => hash(partes.join('|'));

function escolher<T>(lista: readonly [T, ...T[]], n: number): T {
  return lista[n % lista.length] ?? lista[0];
}

function slug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Momento num dia passado, em horário comercial. */
function momento(dia: IsoDate, n: number): IsoDate {
  return `${dia}T${pad(8 + (n % 9))}:${pad((n * 7) % 60)}`;
}

type Relogio = { hoje: IsoDate; agora: IsoDate };

/** Momento de hoje que já passou (antes de `agora`); cedo demais, vai para ontem. */
function momentoHoje(relogio: Relogio, n: number): IsoDate {
  const [h = 0, m = 0] = relogio.agora.slice(11, 16).split(':').map(Number);
  const agoraMin = h * 60 + m;
  const alvo = Math.min(8 * 60 + (n % 420), agoraMin - 5 - (n % 40));
  if (alvo < 0) return momento(somarDias(relogio.hoje, -1), n);
  return `${relogio.hoje}T${pad(Math.floor(alvo / 60))}:${pad(alvo % 60)}`;
}

function decisao(relogio: Relogio, enviadoEm: IsoDate, n: number, hoje: boolean, motivo?: MotivoReprovacao): DecisaoRegistrada {
  const diaSeguinte = somarDias(enviadoEm.slice(0, 10), 1);
  // Nunca no futuro: decisão do dia seguinte a um envio de ontem é de hoje, antes de "agora".
  const em = hoje || diaSeguinte >= relogio.hoje ? momentoHoje(relogio, n) : momento(diaSeguinte, n);
  return motivo
    ? { por: escolher(ANALISTAS, n), em, motivo, observacao: OBSERVACOES[motivo] }
    : { por: escolher(ANALISTAS, n), em };
}

// — Listas de exigências das obras —

/** Toda obra tem as duas habilitações; a maioria tem segurança do trabalho; algumas, obras públicas. */
function listasDaObra(obra: Obra, indice: number, relogio: Relogio): ObraLista[] {
  const h = sorteio(obra.id, 'listas');
  const ids = ['hab-servico', 'hab-material'];
  // A primeira obra sempre tem segurança do trabalho: garante documento de funcionário na demonstração.
  if (indice === 0 || h % 3 !== 2) ids.push('seg-trabalho');
  if (h % 5 === 0) ids.push('obras-publicas');
  const vinculadaEm = momento(somarDias(relogio.hoje, -(40 + (h % 300))), h);
  return ids.map((listaId) => ({ obraId: obra.id, listaId, vinculadaEm }));
}

// — Documentos da empresa —

type Situacao = 'aprovado' | 'venceEmBreve' | 'renovacao' | 'vencido' | 'emAnalise' | 'reprovado' | 'pendente';

/** Perfil "em dia": quase tudo aprovado, alguns vencendo, alguns com renovação na fila. */
function situacaoEmDia(r: number): Situacao {
  if (r < 68) return 'aprovado';
  if (r < 84) return 'venceEmBreve';
  return 'renovacao';
}

/** Perfil "com pendência": de tudo um pouco. */
function situacaoMista(r: number): Situacao {
  if (r < 34) return 'aprovado';
  if (r < 44) return 'venceEmBreve';
  if (r < 56) return 'vencido';
  if (r < 71) return 'emAnalise';
  if (r < 83) return 'reprovado';
  return 'pendente';
}

function documento(relogio: Relogio, fornecedor: Fornecedor, exigido: DocumentoExigido, situacaoBase: Situacao): DocumentoEmpresa {
  const r = sorteio(fornecedor.id, exigido.tipoDocumentoId, 'detalhe');
  const comData = exigido.item.validade === 'comData';
  // Sem validade, não há o que vencer.
  const situacao: Situacao = !comData && (situacaoBase === 'venceEmBreve' || situacaoBase === 'vencido' || situacaoBase === 'renovacao') ? 'aprovado' : situacaoBase;
  const id = `doc-${fornecedor.id}-${exigido.tipoDocumentoId}`;
  const arquivo = `${exigido.tipoDocumentoId}-${slug(fornecedor.razaoSocial)}.pdf`;
  const tamanhoKb = 120 + (r % 1900);
  const paginas = 1 + (r % 14);
  const base = { id, fornecedorId: fornecedor.id, tipoDocumentoId: exigido.tipoDocumentoId, enviosAnteriores: [] };
  const hoje = relogio.hoje;

  switch (situacao) {
    case 'aprovado': {
      const decididoHoje = r % 9 === 0;
      const enviadoEm = decididoHoje ? momento(somarDias(hoje, -1), r) : momento(somarDias(hoje, -(20 + (r % 200))), r);
      return {
        ...base,
        status: 'aprovado',
        validade: comData ? somarDias(hoje, 60 + (r % 300)) : undefined,
        arquivo,
        tamanhoKb,
        enviadoEm,
        decisao: decisao(relogio, enviadoEm, r, decididoHoje),
      };
    }
    case 'venceEmBreve':
    case 'renovacao': {
      const enviadoEm = momento(somarDias(hoje, -(300 + (r % 40))), r);
      const renovadoEm = r % 4 === 0 ? momentoHoje(relogio, r) : momento(somarDias(hoje, -(1 + (r % 4))), r);
      return {
        ...base,
        status: 'aprovado',
        validade: somarDias(hoje, 3 + (r % 25)),
        arquivo,
        tamanhoKb,
        enviadoEm,
        decisao: decisao(relogio, enviadoEm, r, false),
        renovacao:
          situacao === 'renovacao'
            ? {
                arquivo: arquivo.replace('.pdf', '-renovacao.pdf'),
                tamanhoKb: tamanhoKb + 40,
                enviadoEm: renovadoEm,
                prioridade: r % 5 === 0 ? 'urgente' : 'normal',
                paginas,
                validadeInformada: somarDias(hoje, 340 + (r % 30)),
              }
            : undefined,
        enviosAnteriores: situacao === 'renovacao' ? [{ arquivo, enviadoEm: enviadoEm.slice(0, 10), resultado: 'aprovado' }] : [],
      };
    }
    case 'vencido': {
      const enviadoEm = momento(somarDias(hoje, -(380 + (r % 60))), r);
      return {
        ...base,
        status: 'aprovado',
        validade: somarDias(hoje, -(2 + (r % 40))),
        arquivo,
        tamanhoKb,
        enviadoEm,
        decisao: decisao(relogio, enviadoEm, r, false),
      };
    }
    case 'emAnalise':
      return {
        ...base,
        status: 'emAnalise',
        arquivo,
        tamanhoKb,
        paginas,
        validadeInformada: comData ? somarDias(hoje, 300 + (r % 60)) : undefined,
        enviadoEm: r % 6 === 0 ? momentoHoje(relogio, r) : momento(somarDias(hoje, -(1 + (r % 6))), r),
        prioridade: r % 3 === 0 ? 'urgente' : 'normal',
      };
    case 'reprovado': {
      const decididoHoje = r % 2 === 0;
      const enviadoEm = decididoHoje ? momento(somarDias(hoje, -1), r) : momento(somarDias(hoje, -(3 + (r % 15))), r);
      const d = decisao(relogio, enviadoEm, r, decididoHoje, escolher(MOTIVOS, r));
      return {
        ...base,
        status: 'reprovado',
        arquivo,
        tamanhoKb,
        enviadoEm,
        pendenteDesde: d.em.slice(0, 10),
        decisao: d,
        enviosAnteriores: r % 3 === 0 ? [{ arquivo: arquivo.replace('.pdf', '-anterior.pdf'), enviadoEm: somarDias(hoje, -400), resultado: 'aprovado' }] : [],
      };
    }
    case 'pendente':
      return { ...base, status: 'pendente', pendenteDesde: somarDias(hoje, -(5 + (r % 40))) };
  }
}

// — Documentos de funcionário —

type ModoEnvio = 'aprovados' | 'emAnalise' | 'misto';

function envioDeArquivos(
  relogio: Relogio,
  fornecedor: Fornecedor,
  exigido: DocumentoExigido,
  modo: ModoEnvio,
): { envio: EnvioArquivos; arquivos: ArquivoFuncionario[] } {
  const r = sorteio(fornecedor.id, exigido.tipoDocumentoId, 'envio');
  const hoje = relogio.hoje;
  const recente = modo !== 'aprovados';
  // Envio só em análise pode ter chegado hoje. O misto já tem arquivos decididos no dia
  // seguinte ao envio, então chegou há pelo menos dois dias — nenhuma decisão fica no futuro.
  const enviadoEm =
    modo === 'emAnalise'
      ? r % 3 === 0
        ? momentoHoje(relogio, r)
        : momento(somarDias(hoje, -(1 + (r % 4))), r)
      : modo === 'misto'
        ? momento(somarDias(hoje, -(2 + (r % 4))), r)
        : momento(somarDias(hoje, -(30 + (r % 150))), r);
  const envio: EnvioArquivos = {
    id: `env-${fornecedor.id}-${exigido.tipoDocumentoId}`,
    fornecedorId: fornecedor.id,
    tipoDocumentoId: exigido.tipoDocumentoId,
    enviadoEm,
    prioridade: recente && r % 4 === 0 ? 'urgente' : 'normal',
  };
  const quantidade = modo === 'misto' ? 6 + (r % 7) : 3 + (r % 8);
  const inicio = r % Math.max(1, PESSOAS.length - quantidade);
  const comData = exigido.item.validade === 'comData';
  const prefixo = exigido.tipoDocumentoId === 'epi' ? 'ficha-epi' : exigido.tipoDocumentoId;
  const extensao = exigido.tipoDocumentoId === 'rg-cnh' ? 'jpg' : 'pdf';

  const arquivos = PESSOAS.slice(inicio, inicio + quantidade).map((pessoa, i): ArquivoFuncionario => {
    // Misto: os dois primeiros em análise, o terceiro reprovado, um vencido entre os aprovados.
    const status: ArquivoFuncionario['status'] =
      modo === 'emAnalise' ? 'emAnalise' : modo === 'misto' && i < 2 ? 'emAnalise' : modo === 'misto' && i === 2 ? 'reprovado' : 'aprovado';
    const vencido = modo === 'misto' && i === 3 && comData;
    const validade = comData ? (vencido ? somarDias(hoje, -(3 + (r % 20))) : somarDias(hoje, 40 + ((r + i * 37) % 320))) : undefined;
    const n = r + i;
    return {
      id: `arq-${envio.id}-${i + 1}`,
      envioId: envio.id,
      fornecedorId: fornecedor.id,
      tipoDocumentoId: exigido.tipoDocumentoId,
      nome: `${prefixo}-${pessoa}.${extensao}`,
      tamanhoKb: 140 + ((r + i * 53) % 900),
      status,
      validadeInformada: validade,
      validade: status === 'aprovado' ? validade : undefined,
      decisao:
        status === 'emAnalise'
          ? undefined
          : decisao(relogio, enviadoEm, n, status === 'reprovado' && recente, status === 'reprovado' ? escolher(MOTIVOS, n) : undefined),
    };
  });
  return { envio, arquivos };
}

type Gerado = { documentos: DocumentoEmpresa[]; envios: EnvioArquivos[]; arquivos: ArquivoFuncionario[] };

/**
 * Documentos de um fornecedor, para o que as listas das obras dele exigem.
 * `ja`: tipos de documento que já existem (não gera de novo). `forcarMisto`: o primeiro
 * documento de funcionário sai com arquivos em estados diferentes.
 */
function gerarDoFornecedor(ds: Dataset, fornecedor: Fornecedor, ja: ReadonlySet<string> = new Set(), forcarMisto = false): Gerado {
  const relogio = { hoje: ds.hoje, agora: ds.agora };
  const perfil = sorteio(fornecedor.id, 'perfil') % 10;
  const emDia = perfil < 6;
  const gerado: Gerado = { documentos: [], envios: [], arquivos: [] };
  let primeiroFuncionario = true;

  for (const exigido of documentosExigidos(ds, fornecedor.id)) {
    if (ja.has(exigido.tipoDocumentoId)) continue;
    const r = sorteio(fornecedor.id, exigido.tipoDocumentoId) % 100;
    // Opcionais: metade não envia — e tudo bem, não vira pendência.
    if (exigido.obrigatoriedade === 'opcional' && r % 2 === 1) continue;

    if (exigido.escopo === 'empresa') {
      gerado.documentos.push(documento(relogio, fornecedor, exigido, emDia ? situacaoEmDia(r) : situacaoMista(r)));
      continue;
    }
    const modo: ModoEnvio =
      forcarMisto && primeiroFuncionario ? 'misto' : emDia ? (r < 70 ? 'aprovados' : 'emAnalise') : r < 40 ? 'aprovados' : r < 70 ? 'misto' : 'emAnalise';
    primeiroFuncionario = false;
    const { envio, arquivos } = envioDeArquivos(relogio, fornecedor, exigido, modo);
    gerado.envios.push(envio);
    gerado.arquivos.push(...arquivos);
  }
  return gerado;
}

function temEnvioMisto(arquivos: readonly ArquivoFuncionario[]): boolean {
  const porEnvio = new Map<string, Set<string>>();
  for (const a of arquivos) porEnvio.set(a.envioId, (porEnvio.get(a.envioId) ?? new Set()).add(a.status));
  return [...porEnvio.values()].some((s) => s.size > 1);
}

// — Histórico —

function analisesDeHoje(ds: Dataset, documentos: readonly DocumentoEmpresa[], arquivos: readonly ArquivoFuncionario[]): Analise[] {
  const deHoje = (d: DecisaoRegistrada | undefined): d is DecisaoRegistrada => d !== undefined && d.em.startsWith(ds.hoje);
  const analises: Analise[] = [];
  for (const doc of documentos) {
    if (!deHoje(doc.decisao) || (doc.status !== 'aprovado' && doc.status !== 'reprovado')) continue;
    analises.push({
      id: `an-${doc.id}`,
      quando: doc.decisao.em,
      analista: doc.decisao.por,
      documento: nomeDoTipoDocumento(ds, doc.tipoDocumentoId),
      fornecedorId: doc.fornecedorId,
      resultado: doc.status,
      documentoId: doc.id,
      motivo: doc.decisao.motivo,
    });
  }
  for (const arq of arquivos) {
    if (!deHoje(arq.decisao) || arq.status === 'emAnalise') continue;
    analises.push({
      id: `an-${arq.id}`,
      quando: arq.decisao.em,
      analista: arq.decisao.por,
      documento: arq.nome,
      fornecedorId: arq.fornecedorId,
      resultado: arq.status,
      arquivoId: arq.id,
      motivo: arq.decisao.motivo,
    });
  }
  return analises.sort((a, b) => b.quando.localeCompare(a.quando));
}

function eventosDemo(ds: Dataset, gerado: Gerado): EventoHistorico[] {
  const eventos: EventoHistorico[] = [];
  const nome = (tipoDocumentoId: string) => nomeDoTipoDocumento(ds, tipoDocumentoId);
  const obraDoDocumento = (fornecedorId: string, tipoDocumentoId: string) =>
    documentosExigidos(ds, fornecedorId).find((e) => e.tipoDocumentoId === tipoDocumentoId)?.obras[0]?.id;

  const porMomento = new Map<string, ObraLista[]>();
  for (const ol of ds.obraListas) {
    const chave = `${ol.obraId}|${ol.vinculadaEm}`;
    porMomento.set(chave, [...(porMomento.get(chave) ?? []), ol]);
  }
  for (const [chave, grupo] of porMomento) {
    const primeiro = grupo[0];
    if (!primeiro) continue;
    eventos.push({
      id: `ev-listas-${chave}`,
      quando: primeiro.vinculadaEm,
      autor: { kind: 'pessoa', nome: escolher(ANALISTAS, sorteio(chave)) },
      acao: { tipo: 'listasVinculadas', listaIds: grupo.map((g) => g.listaId), obraId: primeiro.obraId },
      obraId: primeiro.obraId,
    });
  }

  for (const doc of gerado.documentos) {
    const documento = nome(doc.tipoDocumentoId);
    const obraId = obraDoDocumento(doc.fornecedorId, doc.tipoDocumentoId);
    const fornecedorId = doc.fornecedorId;
    if (doc.enviadoEm) {
      eventos.push({ id: `ev-envio-${doc.id}`, quando: doc.enviadoEm, autor: { kind: 'fornecedor', fornecedorId }, acao: { tipo: 'documentoEnviado', documento }, obraId, fornecedorId });
    }
    if (doc.renovacao) {
      eventos.push({ id: `ev-renov-${doc.id}`, quando: doc.renovacao.enviadoEm, autor: { kind: 'fornecedor', fornecedorId }, acao: { tipo: 'documentoEnviado', documento }, obraId, fornecedorId });
    }
    if (doc.decisao && doc.status === 'aprovado') {
      eventos.push({ id: `ev-aprov-${doc.id}`, quando: doc.decisao.em, autor: { kind: 'pessoa', nome: doc.decisao.por }, acao: { tipo: 'documentoAprovado', documento }, fornecedorId });
    }
    if (doc.decisao && doc.status === 'reprovado') {
      eventos.push({
        id: `ev-reprov-${doc.id}`,
        quando: doc.decisao.em,
        autor: { kind: 'pessoa', nome: doc.decisao.por },
        acao: { tipo: 'documentoReprovado', documento, motivo: doc.decisao.motivo ?? 'incorreto' },
        fornecedorId,
      });
    }
    if (doc.status === 'aprovado' && doc.validade && doc.validade < ds.hoje) {
      eventos.push({ id: `ev-venc-${doc.id}`, quando: `${doc.validade}T00:00`, autor: { kind: 'sistema' }, acao: { tipo: 'documentoVencido', documento, fornecedorId }, obraId, fornecedorId });
    }
  }

  for (const envio of gerado.envios) {
    const quantidade = gerado.arquivos.filter((a) => a.envioId === envio.id).length;
    eventos.push({
      id: `ev-arquivos-${envio.id}`,
      quando: envio.enviadoEm,
      autor: { kind: 'fornecedor', fornecedorId: envio.fornecedorId },
      acao: { tipo: 'arquivosEnviados', quantidade, documento: nome(envio.tipoDocumentoId) },
      obraId: obraDoDocumento(envio.fornecedorId, envio.tipoDocumentoId),
      fornecedorId: envio.fornecedorId,
    });
  }

  return eventos.sort((a, b) => b.quando.localeCompare(a.quando));
}

// — Entradas —

/**
 * Monta a demonstração sobre os dados reais de `ds` (fornecedores, obras, vínculos):
 * listas das obras, documentos, envios, arquivos, análises de hoje e histórico.
 */
export function gerarDemonstracao(ds: Dataset): Dataset {
  const relogio = { hoje: ds.hoje, agora: ds.agora };
  const obrasOrdenadas = [...ds.obras].sort((a, b) => a.id.localeCompare(b.id));
  const listaIds = new Set(ds.listas.map((l) => l.id));
  const obraListas = obrasOrdenadas.flatMap((obra, i) => listasDaObra(obra, i, relogio)).filter((ol) => listaIds.has(ol.listaId));
  const comListas: Dataset = { ...ds, obraListas };

  const porFornecedor = new Map(ds.fornecedores.map((f) => [f.id, gerarDoFornecedor(comListas, f)]));
  // Pelo menos um documento de funcionário com arquivos em estados diferentes.
  if (!temEnvioMisto([...porFornecedor.values()].flatMap((g) => g.arquivos))) {
    const alvo = ds.fornecedores.find((f) => documentosExigidos(comListas, f.id).some((e) => e.escopo === 'funcionario'));
    if (alvo) porFornecedor.set(alvo.id, gerarDoFornecedor(comListas, alvo, new Set(), true));
  }

  const gerado: Gerado = {
    documentos: [...porFornecedor.values()].flatMap((g) => g.documentos),
    envios: [...porFornecedor.values()].flatMap((g) => g.envios),
    arquivos: [...porFornecedor.values()].flatMap((g) => g.arquivos),
  };
  return {
    ...comListas,
    ...gerado,
    analises: analisesDeHoje(comListas, gerado.documentos, gerado.arquivos),
    eventos: eventosDemo(comListas, gerado),
  };
}

/**
 * Atualiza um fornecedor recarregado da API (e os vínculos dele), sem refazer o resto:
 * o que já foi decidido na sessão continua. Só gera documentos para o que passou a ser
 * exigido (ex.: depois de trocar os tipos).
 */
export function atualizarFornecedor(ds: Dataset, fornecedor: Fornecedor, obraIds: readonly string[]): Dataset {
  const existe = ds.fornecedores.some((f) => f.id === fornecedor.id);
  const vinculos: VinculoObra[] = [
    ...ds.vinculos.filter((v) => v.fornecedorId !== fornecedor.id),
    ...obraIds.map((obraId) => ({ fornecedorId: fornecedor.id, obraId })),
  ];
  const parcial: Dataset = {
    ...ds,
    fornecedores: existe ? ds.fornecedores.map((f) => (f.id === fornecedor.id ? fornecedor : f)) : [fornecedor, ...ds.fornecedores],
    vinculos,
  };
  const ja = new Set([
    ...ds.documentos.filter((d) => d.fornecedorId === fornecedor.id).map((d) => d.tipoDocumentoId),
    ...ds.envios.filter((e) => e.fornecedorId === fornecedor.id).map((e) => e.tipoDocumentoId),
  ]);
  const novo = gerarDoFornecedor(parcial, fornecedor, ja);
  return {
    ...parcial,
    documentos: [...ds.documentos, ...novo.documentos],
    envios: [...ds.envios, ...novo.envios],
    arquivos: [...ds.arquivos, ...novo.arquivos],
  };
}

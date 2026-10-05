import type { Contato, Fornecedor, TipoFornecimento, VinculoObra } from '@/entities';

type LinhaFornecedor = {
  id: string;
  razaoSocial: string;
  cnpj: string;
  tipo: TipoFornecimento;
  desde: string;
  bloqueado?: boolean;
  dominio: string;
};

/** Calcula os dígitos verificadores de um CNPJ a partir dos 12 primeiros. */
function cnpjValido(base12: string): string {
  const calc = (digits: string, pesos: number[]) => {
    const soma = digits.split('').reduce((total, d, i) => total + Number(d) * (pesos[i] ?? 0), 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  const d1 = calc(base12, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = calc(`${base12}${d1}`, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return `${base12}${d1}${d2}`;
}

const LINHAS: readonly LinhaFornecedor[] = [
  // — Do protótipo —
  { id: 'construtora-exemplo', razaoSocial: 'Construtora Exemplo Ltda.', cnpj: '12345678000190', tipo: 'servico', desde: '2026-01-10', dominio: 'construtoraexemplo.com.br' },
  { id: 'eletrica-aracaju', razaoSocial: 'Elétrica Aracaju Ltda.', cnpj: '23456789000101', tipo: 'servico', desde: '2025-12-02', dominio: 'eletricaaracaju.com.br' },
  { id: 'engemax', razaoSocial: 'Engemax Serviços Ltda.', cnpj: '34567890000112', tipo: 'servico', desde: '2025-07-18', dominio: 'engemax.com.br' },
  { id: 'hidro-norte', razaoSocial: 'Hidro Norte Instalações Ltda.', cnpj: '45678901000123', tipo: 'servico', desde: '2026-04-03', dominio: 'hidronorte.com.br' },
  { id: 'serralheria-ponto-firme', razaoSocial: 'Serralheria Ponto Firme ME', cnpj: '56789012000134', tipo: 'material', desde: '2025-11-06', dominio: 'pontofirme.com.br' },
  { id: 'transportes-vale-verde', razaoSocial: 'Transportes Vale Verde Ltda.', cnpj: '67890123000145', tipo: 'servico', desde: '2025-07-22', dominio: 'valeverdetransportes.com.br' },
  { id: 'marcenaria-sol-nascente', razaoSocial: 'Marcenaria Sol Nascente ME', cnpj: '78901234000156', tipo: 'material', desde: '2025-08-11', dominio: 'solnascentemarcenaria.com.br' },
  { id: 'acos-do-recife', razaoSocial: 'Aços do Recife Ltda.', cnpj: '90123456000178', tipo: 'material', desde: '2023-12-14', dominio: 'acosdorecife.com.br' },
  { id: 'cimentos-nordeste', razaoSocial: 'Cimentos Nordeste S.A.', cnpj: '01234567000189', tipo: 'material', desde: '2025-07-21', dominio: 'cimentosnordeste.com.br' },
  { id: 'pinturas-litoral', razaoSocial: 'Pinturas Litoral Ltda.', cnpj: '89012345000167', tipo: 'servico', desde: '2025-11-12', bloqueado: true, dominio: 'pinturaslitoral.com.br' },
  // — Serviço —
  { id: 'gesso-forro-nordeste', razaoSocial: 'Gesso & Forro Nordeste Ltda.', cnpj: cnpjValido('112233440001'), tipo: 'servico', desde: '2026-02-16', dominio: 'gessoforrone.com.br' },
  { id: 'impermeabilizadora-capibaribe', razaoSocial: 'Impermeabilizadora Capibaribe Ltda.', cnpj: cnpjValido('223344550001'), tipo: 'servico', desde: '2026-08-24', dominio: 'impercapibaribe.com.br' },
  { id: 'terraplenagem-agreste', razaoSocial: 'Terraplenagem Agreste Ltda.', cnpj: cnpjValido('334455660001'), tipo: 'servico', desde: '2025-10-06', dominio: 'terraagreste.com.br' },
  { id: 'fundacoes-recife', razaoSocial: 'Fundações Recife Engenharia Ltda.', cnpj: cnpjValido('445566770001'), tipo: 'servico', desde: '2026-03-09', dominio: 'fundacoesrecife.com.br' },
  { id: 'climatiza-pe', razaoSocial: 'Climatiza PE Instalações Ltda.', cnpj: cnpjValido('556677880001'), tipo: 'servico', desde: '2024-01-15', dominio: 'climatizape.com.br' },
  { id: 'esquadrias-boa-vista', razaoSocial: 'Esquadrias Boa Vista Serviços Ltda.', cnpj: cnpjValido('667788990001'), tipo: 'servico', desde: '2025-08-04', dominio: 'esquadriasboavista.com.br' },
  { id: 'vidracaria-cristal', razaoSocial: 'Vidraçaria Cristal do Recife Ltda.', cnpj: cnpjValido('778899000001'), tipo: 'servico', desde: '2026-01-19', dominio: 'cristaldorecife.com.br' },
  { id: 'montagens-suape', razaoSocial: 'Montagens Industriais Suape Ltda.', cnpj: cnpjValido('889900110001'), tipo: 'servico', desde: '2026-02-23', dominio: 'montagenssuape.com.br' },
  { id: 'paisagismo-jardim-tropical', razaoSocial: 'Paisagismo Jardim Tropical ME', cnpj: cnpjValido('990011220001'), tipo: 'servico', desde: '2023-11-06', dominio: 'jardimtropical.com.br' },
  { id: 'elevadores-nordeste', razaoSocial: 'Elevadores Nordeste Manutenção Ltda.', cnpj: cnpjValido('101112130001'), tipo: 'servico', desde: '2024-02-05', dominio: 'elevadoresnordeste.com.br' },
  { id: 'limpeza-brilho', razaoSocial: 'Limpeza Pós-Obra Brilho Ltda.', cnpj: cnpjValido('121314150001'), tipo: 'servico', desde: '2024-03-11', dominio: 'brilholimpeza.com.br' },
  { id: 'gas-rede', razaoSocial: 'Gás & Rede Instalações Ltda.', cnpj: cnpjValido('131415160001'), tipo: 'servico', desde: '2024-01-22', dominio: 'gasrede.com.br' },
  { id: 'concretagem-pernambuco', razaoSocial: 'Concretagem Pernambuco Ltda.', cnpj: cnpjValido('141516170001'), tipo: 'servico', desde: '2026-03-16', dominio: 'concretagempe.com.br' },
  { id: 'guardia-seguranca', razaoSocial: 'Segurança Patrimonial Guardiã Ltda.', cnpj: cnpjValido('151617180001'), tipo: 'servico', desde: '2023-10-23', dominio: 'guardiaseguranca.com.br' },
  { id: 'telecom-conecta', razaoSocial: 'Telecom Obras Conecta Ltda.', cnpj: cnpjValido('161718190001'), tipo: 'servico', desde: '2025-09-01', dominio: 'conectaobras.com.br' },
  { id: 'pisos-mar-azul', razaoSocial: 'Pisos e Revestimentos Mar Azul Ltda.', cnpj: cnpjValido('171819200001'), tipo: 'servico', desde: '2025-08-18', dominio: 'pisosmarazul.com.br' },
  { id: 'andaimes-olinda', razaoSocial: 'Andaimes Olinda Locação e Montagem Ltda.', cnpj: cnpjValido('181920210001'), tipo: 'servico', desde: '2026-02-20', dominio: 'andaimesolinda.com.br' },
  { id: 'topografia-precisao', razaoSocial: 'Topografia Precisão Ltda.', cnpj: cnpjValido('192021220001'), tipo: 'servico', desde: '2026-07-29', dominio: 'topoprecisao.com.br' },
  { id: 'drywall-recife', razaoSocial: 'Drywall Recife Sistemas Ltda.', cnpj: cnpjValido('202122230001'), tipo: 'servico', desde: '2025-09-15', dominio: 'drywallrecife.com.br' },
  { id: 'demolicoes-beberibe', razaoSocial: 'Demolições Beberibe Ltda.', cnpj: cnpjValido('212223240001'), tipo: 'servico', desde: '2023-10-18', dominio: 'demolicoesbeberibe.com.br' },
  // — Material —
  { id: 'madeireira-sao-lourenco', razaoSocial: 'Madeireira São Lourenço Ltda.', cnpj: cnpjValido('222324250001'), tipo: 'material', desde: '2025-10-13', dominio: 'madeireirasl.com.br' },
  { id: 'ceramica-vale-ipojuca', razaoSocial: 'Cerâmica Vale do Ipojuca Ltda.', cnpj: cnpjValido('232425260001'), tipo: 'material', desde: '2026-08-31', dominio: 'ceramicaipojuca.com.br' },
  { id: 'tintas-recife', razaoSocial: 'Tintas Recife Distribuidora Ltda.', cnpj: cnpjValido('242526270001'), tipo: 'material', desde: '2024-02-12', dominio: 'tintasrecife.com.br' },
  { id: 'eletrica-afogados', razaoSocial: 'Elétrica Comercial Afogados Ltda.', cnpj: cnpjValido('252627280001'), tipo: 'material', desde: '2024-01-29', dominio: 'eletricaafogados.com.br' },
  { id: 'hidrossanitarios-nordeste', razaoSocial: 'Hidrossanitários Nordeste Ltda.', cnpj: cnpjValido('262728290001'), tipo: 'material', desde: '2024-02-19', dominio: 'hidrossanitariosne.com.br' },
  { id: 'areia-brita-jaboatao', razaoSocial: 'Areia e Brita Jaboatão Ltda.', cnpj: cnpjValido('272829300001'), tipo: 'material', desde: '2026-03-12', dominio: 'areiabritajaboatao.com.br' },
  { id: 'blocos-paulista', razaoSocial: 'Blocos de Concreto Paulista Ltda.', cnpj: cnpjValido('282930310001'), tipo: 'material', desde: '2025-08-07', dominio: 'blocospaulista.com.br' },
  { id: 'vidros-guararapes', razaoSocial: 'Vidros Temperados Guararapes Ltda.', cnpj: cnpjValido('293031320001'), tipo: 'material', desde: '2024-03-04', dominio: 'vidrosguararapes.com.br' },
  { id: 'loucas-boa-viagem', razaoSocial: 'Louças e Metais Boa Viagem Ltda.', cnpj: cnpjValido('303132330001'), tipo: 'material', desde: '2024-03-18', dominio: 'loucasboaviagem.com.br' },
  { id: 'argamassas-caxanga', razaoSocial: 'Argamassas Caxangá Ltda.', cnpj: cnpjValido('313233340001'), tipo: 'material', desde: '2026-03-19', dominio: 'argamassascaxanga.com.br' },
  { id: 'telhas-agreste', razaoSocial: 'Telhas e Coberturas Agreste Ltda.', cnpj: cnpjValido('323334350001'), tipo: 'material', desde: '2026-03-23', dominio: 'telhasagreste.com.br' },
];

const NOMES = [
  ['Patrícia Albuquerque', 'Gerente administrativa'],
  ['Fernando Siqueira', 'Coordenador de contratos'],
  ['Luciana Barros', 'Analista de suprimentos'],
  ['Roberto Cavalcanti', 'Sócio-diretor'],
  ['Aline Menezes', 'Assistente financeira'],
  ['Gustavo Lins', 'Gerente comercial'],
  ['Renata Queiroz', 'Coordenadora de qualidade'],
  ['Henrique Paiva', 'Diretor de operações'],
] as const;

const SEGURANCA = [
  ['Ivan Menezes', 'Técnico de segurança'],
  ['Juliana Farias', 'Engenheira de segurança do trabalho'],
  ['Severino Lopes', 'Técnico de segurança'],
  ['Carla Tavares', 'Técnica de segurança'],
] as const;

function slugEmail(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '.');
}

function contatosGerados(linha: LinhaFornecedor, indice: number): Contato[] {
  const [nome, cargo] = NOMES[indice % NOMES.length] ?? NOMES[0];
  const fixo = `(81) 3${String(200 + indice * 7).padStart(3, '0')}-${String(1000 + indice * 131).slice(-4)}`;
  const principal: Contato = { papel: 'principal', nome, cargo, email: `${slugEmail(nome)}@${linha.dominio}`, telefone: fixo };
  if (linha.tipo === 'material') return [principal];
  const [nomeSeg, cargoSeg] = SEGURANCA[indice % SEGURANCA.length] ?? SEGURANCA[0];
  const celular = `(81) 9${String(8100 + indice * 37).slice(-4)}-${String(2000 + indice * 173).slice(-4)}`;
  return [principal, { papel: 'seguranca', nome: nomeSeg, cargo: cargoSeg, email: `${slugEmail(nomeSeg)}@${linha.dominio}`, telefone: celular }];
}

const CONTATOS_CONSTRUTORA: readonly Contato[] = [
  { papel: 'principal', nome: 'Débora Castro', cargo: 'Coordenadora administrativa', email: 'debora.castro@construtoraexemplo.com.br', telefone: '(81) 3244-7788' },
  { papel: 'seguranca', nome: 'Ivan Menezes', cargo: 'Técnico de segurança', email: 'ivan.menezes@construtoraexemplo.com.br', telefone: '(81) 99812-4501' },
];

export const fornecedores: readonly Fornecedor[] = LINHAS.map((linha, indice) => ({
  id: linha.id,
  razaoSocial: linha.razaoSocial,
  cnpj: linha.cnpj,
  tipo: linha.tipo,
  email: `suprimentos@${linha.dominio}`,
  desde: linha.desde,
  bloqueado: linha.bloqueado ?? false,
  contatos: linha.id === 'construtora-exemplo' ? CONTATOS_CONSTRUTORA : contatosGerados(linha, indice),
}));

type LinhaVinculo = [fornecedorId: string, obraId: string, servico: string, inicio: string, fim: string, funcionarios: number, vinculadoEm?: string];

const VINCULOS: readonly LinhaVinculo[] = [
  // Residencial Mirante do Parque — 6 fornecedores, 132 funcionários em campo
  ['construtora-exemplo', 'ob-2401', 'Alvenaria e acabamento', '2026-01', '2027-12', 8, '2026-01-10T17:32'],
  ['eletrica-aracaju', 'ob-2401', 'Instalações elétricas', '2026-03', '2027-08', 41],
  ['engemax', 'ob-2401', 'Estrutura metálica', '2026-02', '2027-05', 52],
  ['hidro-norte', 'ob-2401', 'Hidráulica', '2026-04', '2027-09', 31],
  ['serralheria-ponto-firme', 'ob-2401', 'Esquadrias metálicas', '2026-06', '2027-11', 0, '2026-06-06T10:20'],
  ['acos-do-recife', 'ob-2401', 'Vergalhões e telas', '2026-01', '2027-12', 0],
  // Edifício Jardins da Torre — 9 fornecedores, 187 funcionários
  ['construtora-exemplo', 'ob-2402', 'Revestimento de fachada', '2026-05', '2027-03', 7, '2026-05-05T11:15'],
  ['eletrica-aracaju', 'ob-2402', 'Instalações elétricas', '2025-12', '2027-02', 58],
  ['transportes-vale-verde', 'ob-2402', 'Transporte de entulho', '2025-11', '2027-03', 61],
  ['impermeabilizadora-capibaribe', 'ob-2402', 'Impermeabilização de lajes', '2026-08', '2027-01', 34],
  ['vidracaria-cristal', 'ob-2402', 'Pele de vidro da fachada', '2026-01', '2027-02', 27],
  ['pinturas-litoral', 'ob-2402', 'Pintura interna', '2025-11', '2026-12', 0],
  ['acos-do-recife', 'ob-2402', 'Vergalhões e telas', '2025-11', '2026-10', 0],
  ['cimentos-nordeste', 'ob-2402', 'Cimento e argamassa', '2025-11', '2027-03', 0],
  ['ceramica-vale-ipojuca', 'ob-2402', 'Porcelanato e revestimentos', '2026-09', '2027-03', 0],
  // Condomínio Vila Serena — 7 fornecedores, 94 funcionários
  ['engemax', 'ob-2403', 'Estrutura metálica', '2025-10', '2026-12', 28],
  ['transportes-vale-verde', 'ob-2403', 'Transporte de entulho', '2025-10', '2026-12', 12],
  ['terraplenagem-agreste', 'ob-2403', 'Terraplenagem e drenagem', '2025-10', '2026-06', 31],
  ['climatiza-pe', 'ob-2403', 'Climatização das áreas comuns', '2026-02', '2026-12', 23],
  ['serralheria-ponto-firme', 'ob-2403', 'Portões e gradis', '2025-11', '2026-10', 0],
  ['cimentos-nordeste', 'ob-2403', 'Cimento e argamassa', '2025-10', '2026-12', 0],
  ['madeireira-sao-lourenco', 'ob-2403', 'Formas e escoramento', '2025-10', '2026-08', 0],
  // Reserva das Águas — sem lista de exigências
  ['fundacoes-recife', 'ob-2404', 'Sondagem e fundações', '2026-10', '2027-04', 0, '2026-09-03T10:00'],
  ['topografia-precisao', 'ob-2404', 'Levantamento topográfico', '2026-09', '2026-11', 0, '2026-09-03T10:05'],
  ['areia-brita-jaboatao', 'ob-2404', 'Areia e brita', '2026-10', '2027-12', 0, '2026-09-04T14:40'],
  ['blocos-paulista', 'ob-2404', 'Blocos de concreto', '2026-11', '2027-12', 0, '2026-09-04T14:45'],
  // Centro Clínico Boa Viagem — concluída
  ['construtora-exemplo', 'ob-2312', 'Alvenaria e acabamento', '2024-02', '2025-06', 0],
  ['acos-do-recife', 'ob-2312', 'Vergalhões e telas', '2024-01', '2025-05', 0],
  ['climatiza-pe', 'ob-2312', 'Ar-condicionado central', '2024-06', '2025-06', 0],
  ['elevadores-nordeste', 'ob-2312', 'Elevadores e manutenção', '2024-09', '2025-06', 0],
  ['limpeza-brilho', 'ob-2312', 'Limpeza pós-obra', '2025-04', '2025-06', 0],
  ['gas-rede', 'ob-2312', 'Gases medicinais', '2024-08', '2025-05', 0],
  ['tintas-recife', 'ob-2312', 'Tintas e texturas', '2025-01', '2025-05', 0],
  ['eletrica-afogados', 'ob-2312', 'Material elétrico', '2024-03', '2025-04', 0],
  ['hidrossanitarios-nordeste', 'ob-2312', 'Tubos e conexões', '2024-03', '2025-04', 0],
  ['vidros-guararapes', 'ob-2312', 'Vidros temperados', '2024-10', '2025-03', 0],
  ['loucas-boa-viagem', 'ob-2312', 'Louças e metais', '2024-11', '2025-04', 0],
  // Residencial Parque das Palmeiras
  ['engemax', 'ob-2405', 'Estrutura metálica', '2026-04', '2027-09', 0],
  ['transportes-vale-verde', 'ob-2405', 'Transporte de materiais', '2026-03', '2027-10', 0],
  ['pinturas-litoral', 'ob-2405', 'Pintura de fachada', '2026-06', '2027-06', 0],
  ['gesso-forro-nordeste', 'ob-2405', 'Forro de gesso', '2026-05', '2027-04', 0],
  ['concretagem-pernambuco', 'ob-2405', 'Concretagem bombeada', '2026-03', '2027-02', 0],
  ['fundacoes-recife', 'ob-2405', 'Estacas hélice contínua', '2026-03', '2026-07', 0],
  ['cimentos-nordeste', 'ob-2405', 'Cimento e argamassa', '2026-03', '2027-10', 0],
  ['argamassas-caxanga', 'ob-2405', 'Argamassa colante', '2026-04', '2027-08', 0],
  ['telhas-agreste', 'ob-2405', 'Telhas termoacústicas', '2026-07', '2027-03', 0],
  ['areia-brita-jaboatao', 'ob-2405', 'Areia e brita', '2026-03', '2027-10', 0],
  // Edifício Atlântico Sul
  ['engemax', 'ob-2406', 'Cobertura metálica', '2025-08', '2026-11', 0],
  ['transportes-vale-verde', 'ob-2406', 'Transporte de materiais', '2025-07', '2026-12', 0],
  ['esquadrias-boa-vista', 'ob-2406', 'Instalação de esquadrias', '2025-09', '2026-10', 0],
  ['pisos-mar-azul', 'ob-2406', 'Pisos e revestimentos', '2025-10', '2026-11', 0],
  ['drywall-recife', 'ob-2406', 'Paredes em drywall', '2025-10', '2026-09', 0],
  ['telecom-conecta', 'ob-2406', 'Cabeamento estruturado', '2025-11', '2026-10', 0],
  ['marcenaria-sol-nascente', 'ob-2406', 'Portas e rodapés de madeira', '2025-08', '2026-10', 0],
  ['cimentos-nordeste', 'ob-2406', 'Cimento e argamassa', '2025-07', '2026-12', 0],
  ['blocos-paulista', 'ob-2406', 'Blocos de concreto', '2025-08', '2026-06', 0],
  // Condomínio Porto Bello — concluída
  ['paisagismo-jardim-tropical', 'ob-2313', 'Paisagismo das áreas comuns', '2024-03', '2024-11', 0],
  ['guardia-seguranca', 'ob-2313', 'Segurança do canteiro', '2023-11', '2024-12', 0],
  ['demolicoes-beberibe', 'ob-2313', 'Demolição e limpeza do terreno', '2023-11', '2024-02', 0],
  // Torre Empresarial Derby — planejamento
  ['topografia-precisao', 'ob-2407', 'Levantamento topográfico', '2026-08', '2026-10', 0],
  ['demolicoes-beberibe', 'ob-2407', 'Demolição do imóvel existente', '2026-10', '2027-01', 0, '2026-08-12T11:00'],
  ['montagens-suape', 'ob-2407', 'Montagem do canteiro', '2026-11', '2027-02', 0, '2026-08-12T11:10'],
  // Residencial Recanto dos Ipês
  ['transportes-vale-verde', 'ob-2408', 'Transporte de materiais', '2026-02', '2027-08', 0],
  ['andaimes-olinda', 'ob-2408', 'Andaimes fachadeiros', '2026-03', '2027-06', 0],
  ['montagens-suape', 'ob-2408', 'Montagem de gruas', '2026-02', '2027-07', 0],
  ['gesso-forro-nordeste', 'ob-2408', 'Gesso liso', '2026-06', '2027-05', 0],
];

export const vinculos: readonly VinculoObra[] = VINCULOS.map(
  ([fornecedorId, obraId, servicoContratado, inicio, fim, funcionariosEmCampo, vinculadoEm]) => ({
    fornecedorId,
    obraId,
    servicoContratado,
    inicio: `${inicio}-01`,
    fim: `${fim}-01`,
    vinculadoEm: vinculadoEm ?? `${inicio}-02T09:30`,
    funcionariosEmCampo,
  }),
);

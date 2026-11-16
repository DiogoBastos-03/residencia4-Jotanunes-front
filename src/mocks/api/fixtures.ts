/**
 * Fixture do mock de rede (MSW), usado só com VITE_API_MOCK=true. Nenhuma tela importa
 * este arquivo: as telas leem estes dados pela rede, como leriam da API real.
 * São dados fictícios de teste, no formato do contrato (ver ./dados.ts).
 */

/** "Hoje" do mock: base dos vencimentos do acervo e do prazo da postergação. */
export const HOJE_MOCK = '2026-09-16';

type Empresa = { nome: string; cnpj: string; tipo: 'Material' | 'Servico'; desde: string; bloqueada: boolean; dominio: string };

export const EMPRESAS: readonly Empresa[] = [
  { nome: 'Construtora Exemplo Ltda.', cnpj: '12345678000195', tipo: 'Servico', desde: '2026-01-10', bloqueada: false, dominio: 'construtoraexemplo.com.br' },
  { nome: 'Elétrica Aracaju Ltda.', cnpj: '23456789000195', tipo: 'Servico', desde: '2025-12-02', bloqueada: false, dominio: 'eletricaaracaju.com.br' },
  { nome: 'Engemax Serviços Ltda.', cnpj: '34567890000130', tipo: 'Servico', desde: '2025-07-18', bloqueada: false, dominio: 'engemax.com.br' },
  { nome: 'Hidro Norte Instalações Ltda.', cnpj: '45678901000175', tipo: 'Servico', desde: '2026-04-03', bloqueada: false, dominio: 'hidronorte.com.br' },
  { nome: 'Serralheria Ponto Firme ME', cnpj: '56789012000100', tipo: 'Material', desde: '2025-11-06', bloqueada: false, dominio: 'pontofirme.com.br' },
  { nome: 'Transportes Vale Verde Ltda.', cnpj: '67890123000116', tipo: 'Servico', desde: '2025-07-22', bloqueada: false, dominio: 'valeverdetransportes.com.br' },
  { nome: 'Marcenaria Sol Nascente ME', cnpj: '78901234000105', tipo: 'Material', desde: '2025-08-11', bloqueada: false, dominio: 'solnascentemarcenaria.com.br' },
  { nome: 'Aços do Recife Ltda.', cnpj: '90123456000131', tipo: 'Material', desde: '2023-12-14', bloqueada: false, dominio: 'acosdorecife.com.br' },
  { nome: 'Cimentos Nordeste S.A.', cnpj: '01234567000195', tipo: 'Material', desde: '2025-07-21', bloqueada: false, dominio: 'cimentosnordeste.com.br' },
  { nome: 'Pinturas Litoral Ltda.', cnpj: '89012345000179', tipo: 'Servico', desde: '2025-11-12', bloqueada: true, dominio: 'pinturaslitoral.com.br' },
  { nome: 'Gesso & Forro Nordeste Ltda.', cnpj: '11223344000186', tipo: 'Servico', desde: '2026-02-16', bloqueada: false, dominio: 'gessoforrone.com.br' },
  { nome: 'Impermeabilizadora Capibaribe Ltda.', cnpj: '22334455000186', tipo: 'Servico', desde: '2026-08-24', bloqueada: false, dominio: 'impercapibaribe.com.br' },
  { nome: 'Terraplenagem Agreste Ltda.', cnpj: '33445566000186', tipo: 'Servico', desde: '2025-10-06', bloqueada: false, dominio: 'terraagreste.com.br' },
  { nome: 'Fundações Recife Engenharia Ltda.', cnpj: '44556677000186', tipo: 'Servico', desde: '2026-03-09', bloqueada: false, dominio: 'fundacoesrecife.com.br' },
  { nome: 'Climatiza PE Instalações Ltda.', cnpj: '55667788000186', tipo: 'Servico', desde: '2024-01-15', bloqueada: false, dominio: 'climatizape.com.br' },
  { nome: 'Esquadrias Boa Vista Serviços Ltda.', cnpj: '66778899000186', tipo: 'Servico', desde: '2025-08-04', bloqueada: false, dominio: 'esquadriasboavista.com.br' },
  { nome: 'Vidraçaria Cristal do Recife Ltda.', cnpj: '77889900000166', tipo: 'Servico', desde: '2026-01-19', bloqueada: false, dominio: 'cristaldorecife.com.br' },
  { nome: 'Montagens Industriais Suape Ltda.', cnpj: '88990011000107', tipo: 'Servico', desde: '2026-02-23', bloqueada: false, dominio: 'montagenssuape.com.br' },
  { nome: 'Paisagismo Jardim Tropical ME', cnpj: '99001122000160', tipo: 'Servico', desde: '2023-11-06', bloqueada: false, dominio: 'jardimtropical.com.br' },
  { nome: 'Elevadores Nordeste Manutenção Ltda.', cnpj: '10111213000144', tipo: 'Servico', desde: '2024-02-05', bloqueada: false, dominio: 'elevadoresnordeste.com.br' },
  { nome: 'Limpeza Pós-Obra Brilho Ltda.', cnpj: '12131415000183', tipo: 'Servico', desde: '2024-03-11', bloqueada: false, dominio: 'brilholimpeza.com.br' },
  { nome: 'Gás & Rede Instalações Ltda.', cnpj: '13141516000106', tipo: 'Servico', desde: '2024-01-22', bloqueada: false, dominio: 'gasrede.com.br' },
  { nome: 'Concretagem Pernambuco Ltda.', cnpj: '14151617000112', tipo: 'Servico', desde: '2026-03-16', bloqueada: false, dominio: 'concretagempe.com.br' },
  { nome: 'Segurança Patrimonial Guardiã Ltda.', cnpj: '15161718000137', tipo: 'Servico', desde: '2023-10-23', bloqueada: false, dominio: 'guardiaseguranca.com.br' },
  { nome: 'Telecom Obras Conecta Ltda.', cnpj: '16171819000151', tipo: 'Servico', desde: '2025-09-01', bloqueada: false, dominio: 'conectaobras.com.br' },
  { nome: 'Pisos e Revestimentos Mar Azul Ltda.', cnpj: '17181920000156', tipo: 'Servico', desde: '2025-08-18', bloqueada: false, dominio: 'pisosmarazul.com.br' },
  { nome: 'Andaimes Olinda Locação e Montagem Ltda.', cnpj: '18192021000111', tipo: 'Servico', desde: '2026-02-20', bloqueada: false, dominio: 'andaimesolinda.com.br' },
  { nome: 'Topografia Precisão Ltda.', cnpj: '19202122000199', tipo: 'Servico', desde: '2026-07-29', bloqueada: false, dominio: 'topoprecisao.com.br' },
  { nome: 'Drywall Recife Sistemas Ltda.', cnpj: '20212223000120', tipo: 'Servico', desde: '2025-09-15', bloqueada: false, dominio: 'drywallrecife.com.br' },
  { nome: 'Demolições Beberibe Ltda.', cnpj: '21222324000144', tipo: 'Servico', desde: '2023-10-18', bloqueada: false, dominio: 'demolicoesbeberibe.com.br' },
  { nome: 'Madeireira São Lourenço Ltda.', cnpj: '22232425000169', tipo: 'Material', desde: '2025-10-13', bloqueada: false, dominio: 'madeireirasl.com.br' },
  { nome: 'Cerâmica Vale do Ipojuca Ltda.', cnpj: '23242526000183', tipo: 'Material', desde: '2026-08-31', bloqueada: false, dominio: 'ceramicaipojuca.com.br' },
  { nome: 'Tintas Recife Distribuidora Ltda.', cnpj: '24252627000106', tipo: 'Material', desde: '2024-02-12', bloqueada: false, dominio: 'tintasrecife.com.br' },
  { nome: 'Elétrica Comercial Afogados Ltda.', cnpj: '25262728000112', tipo: 'Material', desde: '2024-01-29', bloqueada: false, dominio: 'eletricaafogados.com.br' },
  { nome: 'Hidrossanitários Nordeste Ltda.', cnpj: '26272829000137', tipo: 'Material', desde: '2024-02-19', bloqueada: false, dominio: 'hidrossanitariosne.com.br' },
  { nome: 'Areia e Brita Jaboatão Ltda.', cnpj: '27282930000131', tipo: 'Material', desde: '2026-03-12', bloqueada: false, dominio: 'areiabritajaboatao.com.br' },
  { nome: 'Blocos de Concreto Paulista Ltda.', cnpj: '28293031000105', tipo: 'Material', desde: '2025-08-07', bloqueada: false, dominio: 'blocospaulista.com.br' },
  { nome: 'Vidros Temperados Guararapes Ltda.', cnpj: '29303132000174', tipo: 'Material', desde: '2024-03-04', bloqueada: false, dominio: 'vidrosguararapes.com.br' },
  { nome: 'Louças e Metais Boa Viagem Ltda.', cnpj: '30313233000105', tipo: 'Material', desde: '2024-03-18', bloqueada: false, dominio: 'loucasboaviagem.com.br' },
  { nome: 'Argamassas Caxangá Ltda.', cnpj: '31323334000120', tipo: 'Material', desde: '2026-03-19', bloqueada: false, dominio: 'argamassascaxanga.com.br' },
  { nome: 'Telhas e Coberturas Agreste Ltda.', cnpj: '32333435000144', tipo: 'Material', desde: '2026-03-23', bloqueada: false, dominio: 'telhasagreste.com.br' },
];

export const OBRAS: readonly string[] = [
  'Residencial Mirante do Parque',
  'Edifício Jardins da Torre',
  'Condomínio Vila Serena',
  'Reserva das Águas',
  'Centro Clínico Boa Viagem',
  'Residencial Parque das Palmeiras',
  'Edifício Atlântico Sul',
  'Condomínio Porto Bello',
  'Torre Empresarial Derby',
  'Residencial Recanto dos Ipês',
];

/** [índice da empresa, índice da obra]. */
export const VINCULOS: ReadonlyArray<readonly [number, number]> = [
  [0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [7, 0], [0, 1], [1, 1], [5, 1], [11, 1], [16, 1], [9, 1], [7, 1], [8, 1],
  [31, 1], [2, 2], [5, 2], [12, 2], [14, 2], [4, 2], [8, 2], [30, 2], [13, 3], [27, 3], [35, 3], [36, 3], [0, 4],
  [7, 4], [14, 4], [19, 4], [20, 4], [21, 4], [32, 4], [33, 4], [34, 4], [37, 4], [38, 4], [2, 5], [5, 5], [9, 5],
  [10, 5], [22, 5], [13, 5], [8, 5], [39, 5], [40, 5], [35, 5], [2, 6], [5, 6], [15, 6], [25, 6], [28, 6], [24, 6],
  [6, 6], [8, 6], [36, 6], [18, 7], [23, 7], [29, 7], [27, 8], [29, 8], [17, 8], [5, 9], [26, 9], [17, 9], [10, 9],
];

/** Definições de documento do acervo. As de escopo Enterprise contam no painel de pendências. */
export const DEFINICOES: ReadonlyArray<{ nome: string; escopo: 'Enterprise' | 'Employee' }> = [
  { nome: 'Contrato Social consolidado', escopo: 'Enterprise' },
  { nome: 'Cartão CNPJ', escopo: 'Enterprise' },
  { nome: 'Certidão Negativa de Débitos Federais', escopo: 'Enterprise' },
  { nome: 'Certidão de Regularidade do FGTS', escopo: 'Enterprise' },
  { nome: 'Certidão Negativa de Débitos Trabalhistas', escopo: 'Enterprise' },
  { nome: 'PGR – Programa de Gerenciamento de Riscos', escopo: 'Enterprise' },
  { nome: 'Apólice de Seguro de Responsabilidade Civil', escopo: 'Enterprise' },
  { nome: 'ASO dos funcionários', escopo: 'Employee' },
  { nome: 'Ficha de entrega de EPI', escopo: 'Employee' },
];

/** Funcionários das empresas de serviço (documentos de escopo Employee). */
export const FUNCIONARIOS: readonly string[] = ['José Souza', 'Marcos Lima', 'Antônio Silva', 'Rafael Barbosa', 'Edson Santos', 'Paulo Nogueira'];

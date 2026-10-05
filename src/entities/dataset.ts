import type { IsoDate } from './common';
import type { DocumentoEmpresa } from './documento';
import type { Fornecedor, VinculoObra } from './fornecedor';
import type { Funcionario, Remessa } from './funcionario';
import type { Analise, EventoHistorico, TempoAnalise } from './historico';
import type { ListaExigencias, TipoDocumento } from './listaExigencias';
import type { Obra, ObraLista } from './obra';

/** Tudo o que o sistema conhece. Hoje vem de mocks; amanhã, da API. */
export type Dataset = {
  /** "Hoje" do sistema — as esperas, prazos e vencimentos são calculados a partir dele. */
  hoje: IsoDate;
  agora: IsoDate;
  obras: readonly Obra[];
  obraListas: readonly ObraLista[];
  listas: readonly ListaExigencias[];
  tiposDocumento: readonly TipoDocumento[];
  fornecedores: readonly Fornecedor[];
  vinculos: readonly VinculoObra[];
  documentos: readonly DocumentoEmpresa[];
  remessas: readonly Remessa[];
  funcionarios: readonly Funcionario[];
  analises: readonly Analise[];
  eventos: readonly EventoHistorico[];
  temposAnalise: readonly TempoAnalise[];
};

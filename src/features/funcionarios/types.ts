import type {
  DocumentoFuncionario,
  DocumentoPessoaExigido,
  Fornecedor,
  Funcionario,
  ItemFuncionarios,
  ListaExigencias,
  Obra,
  Remessa,
  StatusDocumento,
} from '@/entities';

export type DocumentoDaPessoa = {
  exigido: DocumentoPessoaExigido;
  enviado: DocumentoFuncionario | undefined;
  status: StatusDocumento;
};

export type FichaFuncionario = {
  funcionario: Funcionario;
  fornecedor: Fornecedor;
  obra: Obra;
  remessa: Remessa;
  remessaTamanho: number;
  lista: ListaExigencias;
  item: ItemFuncionarios;
  documentos: DocumentoDaPessoa[];
};

import type { ErrosFormFornecedor, NovoFornecedor } from '../../types';

export type BlocoProps = {
  dados: NovoFornecedor;
  erros: ErrosFormFornecedor;
  onChange: (parcial: Partial<NovoFornecedor>) => void;
};

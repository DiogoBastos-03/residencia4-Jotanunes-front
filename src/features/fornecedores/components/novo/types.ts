import type { NovoFornecedor } from '../../types';

export type ErrosNovoFornecedor = Partial<Record<'cnpj' | 'razaoSocial' | 'contatoNome' | 'email' | 'servico', string>>;

export type BlocoProps = {
  dados: NovoFornecedor;
  erros: ErrosNovoFornecedor;
  onChange: (parcial: Partial<NovoFornecedor>) => void;
};

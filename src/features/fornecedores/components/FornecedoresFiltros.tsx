import { strings } from '@/shared/strings';
import { FilterBar, Inline, Select } from '@/shared/ui';
import type { FiltrosFornecedores } from '../hooks/useFiltrosFornecedores';
import type { FiltroSituacao, FiltroTipo, ListaFornecedores } from '../types';

const t = strings.pages.fornecedores;

function ehTipo(valor: string): valor is FiltroTipo {
  return valor === 'todos' || valor === 'servico' || valor === 'material';
}

type Props = {
  lista: ListaFornecedores;
  filtros: FiltrosFornecedores;
  onChange: (parcial: Partial<FiltrosFornecedores>) => void;
};

export function FornecedoresFiltros({ lista, filtros, onChange }: Props) {
  const opcoes: ReadonlyArray<{ value: FiltroSituacao; label: string; count: number }> = [
    { value: 'todos', label: t.filtros.todos, count: lista.porSituacao.todos },
    { value: 'apto', label: t.filtros.apto, count: lista.porSituacao.apto },
    { value: 'comPendencia', label: t.filtros.comPendencia, count: lista.porSituacao.comPendencia },
    { value: 'bloqueado', label: t.filtros.bloqueado, count: lista.porSituacao.bloqueado },
  ];
  return (
    <Inline>
      <FilterBar label={t.filtrosLabel} options={opcoes} value={filtros.situacao} onChange={(situacao) => onChange({ situacao })} />
      <Select
        aria-label={t.tipoLabel}
        size="sm"
        wrapperClassName="w-44 max-sm:w-full"
        value={filtros.tipo}
        onChange={(e) => {
          if (ehTipo(e.target.value)) onChange({ tipo: e.target.value });
        }}
        options={[
          { value: 'todos', label: t.tipos.todos },
          { value: 'servico', label: t.tipos.servico(lista.porTipo.servico) },
          { value: 'material', label: t.tipos.material(lista.porTipo.material) },
        ]}
      />
    </Inline>
  );
}

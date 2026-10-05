import type { Fila } from '../types';
import type { FiltrosFila } from '../lib';
import { strings } from '@/shared/strings';
import { FilterBar, Inline, Select } from '@/shared/ui';

const t = strings.pages.fila;

type FilaFiltrosProps = {
  fila: Fila;
  filtros: FiltrosFila;
  onChange: (parcial: Partial<FiltrosFila>) => void;
};

/** Faixa Todos/Documentos/Funcionários/Urgentes + obra. */
export function FilaFiltros({ fila, filtros, onChange }: FilaFiltrosProps) {
  const obras = [...new Map(fila.entradas.map((e) => [e.obraPrincipal.id, e.obraPrincipal])).values()];
  const opcoesObra = [
    { value: '', label: t.todasObras },
    ...obras.map((o) => ({ value: o.id, label: t.obraOpcao(o.nome, fila.entradas.filter((e) => e.obraPrincipal.id === o.id).length) })),
  ];
  return (
    <Inline>
      <FilterBar
        label={t.filtrosLabel}
        value={filtros.tipo}
        onChange={(tipo) => onChange({ tipo })}
        options={[
          { value: 'todos', label: t.filtros.todos, count: fila.contagem.todos },
          { value: 'documentos', label: t.filtros.documentos, count: fila.contagem.documentos },
          { value: 'funcionarios', label: t.filtros.funcionarios, count: fila.contagem.funcionarios },
          { value: 'urgentes', label: t.filtros.urgentes, count: fila.contagem.urgentes },
        ]}
      />
      <Select
        aria-label={t.obraLabel}
        size="sm"
        options={opcoesObra}
        value={filtros.obraId}
        onChange={(e) => onChange({ obraId: e.target.value })}
        wrapperClassName="w-64 max-sm:w-full"
      />
    </Inline>
  );
}

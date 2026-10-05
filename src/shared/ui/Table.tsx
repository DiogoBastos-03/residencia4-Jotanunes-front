import type { ReactNode } from 'react';
import { cn } from '@/shared/lib';
import { strings } from '@/shared/strings';
import { Button } from './Button';
import { ButtonLink } from './ButtonLink';

export type TableColumn<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** Largura fixa no desktop (classe de largura, ex.: 'w-50'). */
  width?: string;
  /** strong: 14/500 tinta principal. muted: 14 tinta 3. soft: 14 tinta 2. */
  tone?: 'strong' | 'soft' | 'muted';
  nowrap?: boolean;
  /** Como a coluna aparece no cartão móvel. Padrão: par rótulo/valor. */
  mobile?: 'title' | 'badge' | 'field' | 'hide';
  /** Quantas colunas esta célula ocupa (as seguintes são puladas). */
  span?: (row: T) => number;
};

export type TableAction<T> = {
  label: (row: T) => string;
  /** Complemento do nome acessível — ex.: o nome do registro. */
  describe?: (row: T) => string;
  onClick?: (row: T) => void;
  to?: (row: T) => string;
  /** Botão com borda em vez de terciário (ação que pede atenção). */
  emphasis?: (row: T) => boolean;
};

type TableProps<T> = {
  /** Descrição da tabela para leitores de tela. */
  caption: string;
  columns: readonly TableColumn<T>[];
  rows: readonly T[];
  rowKey: (row: T) => string;
  action?: TableAction<T>;
  density?: 'default' | 'compact';
  className?: string;
};

const TONE = {
  strong: 'font-medium text-ink',
  soft: 'text-ink-2',
  muted: 'text-ink-3',
} as const;

function ActionButton<T>({ action, row, mobile }: { action: TableAction<T>; row: T; mobile: boolean }) {
  const label = action.label(row);
  const described = action.describe ? `${label} — ${action.describe(row)}` : undefined;
  const emphasis = action.emphasis?.(row) ?? false;
  const variant = mobile || emphasis ? 'secondary' : 'tertiary';
  if (action.to) {
    return (
      <ButtonLink to={action.to(row)} variant={variant} size="sm" fullWidth={mobile} aria-label={described}>
        {label}
      </ButtonLink>
    );
  }
  return (
    <Button
      variant={variant}
      size="sm"
      fullWidth={mobile}
      aria-label={described}
      onClick={() => action.onClick?.(row)}
    >
      {label}
    </Button>
  );
}

function visibleCells<T>(columns: readonly TableColumn<T>[], row: T) {
  const cells: Array<{ column: TableColumn<T>; span: number }> = [];
  let skip = 0;
  for (const column of columns) {
    if (skip > 0) {
      skip -= 1;
      continue;
    }
    const span = column.span?.(row) ?? 1;
    skip = span - 1;
    cells.push({ column, span });
  }
  return cells;
}

/** Tabela no desktop; lista de cartões abaixo de 1024px. Sem zebra, sem rolagem lateral. */
export function Table<T>({ caption, columns, rows, rowKey, action, density = 'default', className }: TableProps<T>) {
  const compact = density === 'compact';
  const titleColumn = columns.find((c) => c.mobile === 'title') ?? columns[0];
  const badgeColumn = columns.find((c) => c.mobile === 'badge');
  const fieldColumns = columns.filter(
    (c) => c !== titleColumn && c !== badgeColumn && c.mobile !== 'hide',
  );

  return (
    <div className={className}>
      <div className="hidden overflow-hidden rounded-control border border-border lg:block">
        <table className="w-full border-collapse">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="bg-surface-2">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    'text-left text-label font-medium text-ink-3',
                    compact ? 'px-3 py-2' : 'px-4 py-2.25',
                    column.width,
                  )}
                >
                  {column.header}
                </th>
              ))}
              {action && (
                <th scope="col" className={compact ? 'px-3 py-2' : 'px-4 py-2.25'}>
                  <span className="sr-only">{strings.ui.table.actions}</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={rowKey(row)} className="border-b border-border last:border-b-0">
                {visibleCells(columns, row).map(({ column, span }) => (
                  <td
                    key={column.key}
                    colSpan={span > 1 ? span : undefined}
                    className={cn(
                      compact ? 'h-10 px-3 py-2.5 text-support' : 'h-12 px-4 py-3 text-body',
                      TONE[column.tone ?? 'muted'],
                      column.nowrap && 'whitespace-nowrap',
                    )}
                  >
                    {column.cell(row)}
                  </td>
                ))}
                {action && (
                  <td className={cn('text-right', compact ? 'px-3 py-1' : 'px-4 py-2')}>
                    <ActionButton action={action} row={row} mobile={false} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul aria-label={caption} className="flex flex-col gap-2 lg:hidden">
        {rows.map((row) => (
          <li key={rowKey(row)} className="rounded-control border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 text-body font-medium text-ink">{titleColumn?.cell(row)}</div>
              {badgeColumn && <div className="flex-none">{badgeColumn.cell(row)}</div>}
            </div>
            {fieldColumns.length > 0 && (
              <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                {fieldColumns.map((column) => (
                  <div key={column.key} className="min-w-0">
                    <dt className="text-label font-medium text-ink-3">{column.header}</dt>
                    <dd className="mt-0.5 text-body break-words text-ink-2">{column.cell(row)}</dd>
                  </div>
                ))}
              </dl>
            )}
            {action && (
              <div className="mt-3">
                <ActionButton action={action} row={row} mobile />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

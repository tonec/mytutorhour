import { Virtualizer } from '@tanstack/react-virtual';
import { TableBody, TableCell, TableRow } from '../ui/table';
import { StudentReactTable } from './table-types';

export interface StudentTableBodyProps {
  table: StudentReactTable;
  rowVirtualizer: Virtualizer<HTMLDivElement, HTMLTableRowElement>;
}

export function StudentTableBody({ table, rowVirtualizer }: StudentTableBodyProps) {
  const { rows } = table.getRowModel();

  if (!rows.length) {
    return (
      <TableBody className="grid">
        <TableRow className="flex">
          <TableCell className="flex h-24 w-full items-center justify-center">
            No results.
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody className="relative grid" style={{ height: rowVirtualizer.getTotalSize() }}>
      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const row = rows[virtualRow.index];

        return (
          <TableRow
            key={row.id}
            data-index={virtualRow.index}
            data-state={row.getIsSelected() ? 'selected' : undefined}
            data-testid="student-row"
            ref={rowVirtualizer.measureElement}
            className="absolute flex w-full cursor-pointer"
            style={{ transform: `translateY(${virtualRow.start}px)` }}
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell
                key={cell.id}
                className="flex shrink-0 items-center overflow-hidden"
                style={{ width: cell.column.getSize() }}
              >
                <div className="truncate">
                  <table.FlexRender cell={cell} />
                </div>
              </TableCell>
            ))}
          </TableRow>
        );
      })}
    </TableBody>
  );
}

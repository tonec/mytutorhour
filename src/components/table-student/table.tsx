'use client';

import {
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type ReactTable,
  type SortingState,
  useTable,
} from '@tanstack/react-table';
import { type Virtualizer, useVirtualizer } from '@tanstack/react-virtual';
import { type MouseEvent, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { StudentListItem } from '@/services/db/student/mappers';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type DataTableFeatures, features } from '../data-table/data-table-features';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { columns } from './columns';
import { studentUrl } from './student-url';

type StudentReactTable = ReactTable<DataTableFeatures, StudentListItem>;

const ESTIMATED_ROW_HEIGHT = 49;

// Controls inside a row (checkbox, name link, actions menu) handle their own clicks.
const INTERACTIVE_SELECTOR = 'a, button, input, label, [role="checkbox"], [role="menuitem"]';

function isRowBackgroundClick(event: MouseEvent<HTMLTableRowElement>) {
  const target = event.target as Element;
  // React bubbles events out of portals (e.g. the actions menu), so ignore anything outside the row
  return event.currentTarget.contains(target) && !target.closest(INTERACTIVE_SELECTOR);
}

export function StudentTable({ students }: { students: StudentListItem[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>({});
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const table = useTable({
    features,
    data: students,
    columns,
    // Stable ids, so per-row state (e.g. an open notes dialog) follows the student across sorts
    getRowId: (student) => student.id,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    state: {
      sorting,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
  });

  const { rows } = table.getRowModel();

  // Owned here, not in the body: React attaches refs and runs layout effects child-first, so a
  // virtualizer inside the scroll container would mount before `tableContainerRef` is set and
  // render no rows until something else triggered a re-render.
  const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
    count: rows.length,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    getScrollElement: () => tableContainerRef.current,
    // Firefox measures table border height incorrectly, so fall back to the estimate there
    measureElement:
      typeof window !== 'undefined' && !navigator.userAgent.includes('Firefox')
        ? (element) => element.getBoundingClientRect().height
        : undefined,
    overscan: 5,
  });

  return (
    <>
      <div className="flex items-center gap-2 py-4">
        <Input
          placeholder="Filter students..."
          value={(table.getColumn('displayName')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('displayName')?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" className="ml-auto" />}>
            Columns
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* Rows are absolutely positioned, so the table uses grid/flex layout with fixed column widths */}
      <div
        ref={tableContainerRef}
        className="relative h-[70dvh] w-full overflow-auto rounded-md border"
      >
        <table className="grid min-w-full text-sm" style={{ width: table.getTotalSize() }}>
          <StudentTableHeader table={table} />
          <StudentTableBody table={table} rowVirtualizer={rowVirtualizer} />
        </table>
      </div>
    </>
  );
}

function StudentTableHeader({ table }: { table: StudentReactTable }) {
  return (
    <TableHeader className="bg-background sticky top-0 z-10 grid">
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id} className="flex w-full">
          {headerGroup.headers.map((header) => (
            <TableHead
              key={header.id}
              className="flex shrink-0 items-center"
              style={{ width: header.getSize() }}
            >
              {header.isPlaceholder ? null : <table.FlexRender header={header} />}
            </TableHead>
          ))}
        </TableRow>
      ))}
    </TableHeader>
  );
}

interface StudentTableBodyProps {
  table: StudentReactTable;
  rowVirtualizer: Virtualizer<HTMLDivElement, HTMLTableRowElement>;
}

function StudentTableBody({ table, rowVirtualizer }: StudentTableBodyProps) {
  const router = useRouter();
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
            onClick={(event) => {
              if (isRowBackgroundClick(event)) router.push(studentUrl(row.original.id));
            }}
            style={{ transform: `translateY(${virtualRow.start}px)` }}
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell
                key={cell.id}
                className="flex shrink-0 items-center overflow-hidden"
                style={{ width: cell.column.getSize() }}
              >
                <table.FlexRender cell={cell} />
              </TableCell>
            ))}
          </TableRow>
        );
      })}
    </TableBody>
  );
}

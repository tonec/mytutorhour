'use client';

import {
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type SortingState,
  useTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Columns3Cog, UserRoundPlus } from 'lucide-react';
import { useRef, useState } from 'react';
import type { FamilyListItem } from '@/services/db/family';
import type { StudentListItem } from '@/services/db/student/mappers';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { features } from '../data-table/data-table-features';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { AddStudentDialog } from './add-student-dialog';
import { StudentTableBody } from './table-body';
import { columns } from './table-columns';
import { StudentTableHeader } from './table-header';

const ESTIMATED_ROW_HEIGHT = 49;

type Props = {
  students: StudentListItem[];
  families: FamilyListItem[];
};

export function StudentTable({ students, families }: Props) {
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const addStudentButtonRef = useRef<HTMLButtonElement>(null);
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
  // eslint-disable-next-line react-hooks/incompatible-library
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
      <div className="flex items-center justify-between gap-2 p-2">
        <div className="flex gap-2">
          <Input
            variant="flat"
            placeholder="Filter students..."
            value={(table.getColumn('displayName')?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn('displayName')?.setFilterValue(event.target.value)}
            className="max-w-xs"
          />
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  ref={addStudentButtonRef}
                  variant="secondary"
                  size="lg"
                  aria-label="Add student"
                  data-testid="add-student-button"
                  onClick={() => setAddStudentOpen(true)}
                >
                  <UserRoundPlus className="ml-1" />
                </Button>
              }
            />
            <TooltipContent>
              <p>Add student</p>
            </TooltipContent>
          </Tooltip>
          <AddStudentDialog
            families={families}
            open={addStudentOpen}
            onOpenChange={setAddStudentOpen}
            returnFocusTo={addStudentButtonRef}
          />
        </div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="secondary" size="icon" aria-label="Show / hide columns" />}
            >
              <Columns3Cog />
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
      </div>

      {/* Rows are absolutely positioned, so the table uses grid/flex layout. Columns grow to fill the
          container but never shrink below their size; past that, the container scrolls sideways */}
      <div
        ref={tableContainerRef}
        className="scrollbar-thumb-border scrollbar-track-foreground-muted relative block h-[calc(100vh-134px)] w-full scrollbar-thin overflow-auto"
      >
        <table className="grid w-full text-sm" style={{ minWidth: table.getTotalSize() }}>
          <StudentTableHeader table={table} />
          <StudentTableBody table={table} rowVirtualizer={rowVirtualizer} />
        </table>
      </div>
    </>
  );
}

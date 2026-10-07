'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { useTable } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import type { StudentListItem } from '@/services/db/student/mappers';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { type DataTableFeatures, features } from '../data-table/data-table-features';

const columnHelper = createColumnHelper<DataTableFeatures, StudentListItem>();

export const columns = columnHelper.columns([
  columnHelper.accessor('displayName', {
    header: 'Name',
  }),
  columnHelper.accessor('familyName', {
    header: 'Family',
  }),
  columnHelper.accessor('notes', {
    header: 'Notes',
  }),
  columnHelper.accessor('email', {
    header: 'Contact email',
  }),
  columnHelper.accessor('phone', {
    header: 'Contact phone',
  }),
  columnHelper.accessor('subject', {
    header: 'Subject',
  }),
  columnHelper.accessor('tags', {
    header: 'Tags',
  }),
  columnHelper.display({
    id: 'actions',
    cell: ({ row }) => {
      const payment = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(payment.id)}>
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  }),
]);

export function StudentTable({ students }: { students: StudentListItem[] }) {
  const table = useTable({
    features,
    data: students,
    columns,
  });

  return (
    <div className="w-full overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

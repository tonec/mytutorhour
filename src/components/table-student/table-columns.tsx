import { type Column, createColumnHelper } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import { StudentListItem } from '@/services/db/student/mappers';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { type DataTableFeatures } from '../data-table/data-table-features';
import { StudentActions } from './student-actions';
import { studentUrl } from './student-url';

const columnHelper = createColumnHelper<DataTableFeatures, StudentListItem>();

type SortableColumn = Pick<
  Column<DataTableFeatures, StudentListItem>,
  'toggleSorting' | 'getIsSorted'
>;

function headerWithSort(title: string) {
  return function SortHeader({ column }: { column: SortableColumn }) {
    return (
      <button
        type="button"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="flex cursor-pointer items-center"
      >
        {title}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </button>
    );
  };
}

export const columns = columnHelper.columns([
  columnHelper.display({
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    size: 58,
    enableSorting: false,
    enableHiding: false,
  }),
  columnHelper.accessor('displayName', {
    header: headerWithSort('Name'),
    cell: ({ row, getValue }) => (
      <Link href={studentUrl(row.original.id)} className="font-medium hover:underline">
        {getValue()}
      </Link>
    ),
  }),
  columnHelper.accessor('type', {
    header: headerWithSort('Title'),
    size: 100,
    cell: ({ getValue }) => (
      <Badge variant="secondary" data-testid="student-type-badge">
        {getValue() === 'child' ? 'Child' : 'Adult'}
      </Badge>
    ),
  }),
  columnHelper.accessor('familyName', {
    header: headerWithSort('Family'),
  }),
  columnHelper.accessor('email', {
    header: headerWithSort('Contact email'),
  }),
  columnHelper.accessor('phone', {
    header: headerWithSort('Contact phone'),
  }),
  columnHelper.accessor('subject', {
    header: headerWithSort('Subject'),
  }),
  columnHelper.accessor('tags', {
    header: 'Tags',
    cell: ({ getValue }) => (
      <div className="flex gap-2">
        {getValue().map((tag: { id: string; name: string }) => (
          <Badge key={tag.id} variant="secondary" data-testid="student-type-badge">
            {tag.name}
          </Badge>
        ))}
      </div>
    ),
  }),
  columnHelper.display({
    id: 'actions',
    cell: ({ row }) => <StudentActions student={row.original} />,
  }),
]);

import { type Column, createColumnHelper } from '@tanstack/react-table';
import { ArrowDownAZ, ArrowUpZA } from 'lucide-react';
import Link from 'next/link';
import { StudentListItem } from '@/services/db/student/mappers';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { type DataTableFeatures } from '../data-table/data-table-features';
import { StudentActions } from './student-actions';
import { StudentContact } from './student-contact';
import { studentUrl } from './student-url';

const columnHelper = createColumnHelper<DataTableFeatures, StudentListItem>();

type SortableColumn = Pick<
  Column<DataTableFeatures, StudentListItem>,
  'toggleSorting' | 'getIsSorted'
>;

function headerWithSort(title: string) {
  return function SortHeader({ column }: { column: SortableColumn }) {
    const isSorted: false | 'asc' | 'desc' = column.getIsSorted();

    return (
      <button
        type="button"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="flex h-full w-full cursor-pointer items-center"
      >
        {title}
        {isSorted && isSorted === 'asc' && (
          <ArrowDownAZ className="text-muted-foreground ml-2" size={16} />
        )}
        {isSorted && isSorted === 'desc' && (
          <ArrowUpZA className="text-muted-foreground ml-2" size={16} />
        )}
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
    size: 48,
    maxSize: 48,
    enableSorting: false,
    enableHiding: false,
  }),
  columnHelper.accessor('displayName', {
    header: headerWithSort('Name'),
    size: 180,
    cell: ({ row, getValue }) => (
      <Link href={studentUrl(row.original.id)} className="font-medium hover:underline">
        {getValue()}
      </Link>
    ),
  }),
  columnHelper.accessor('type', {
    header: headerWithSort('Type'),
    size: 90,
    maxSize: 90,
    cell: ({ getValue }) => (
      <Badge variant="secondary" data-testid="student-type-badge">
        {getValue() === 'child' ? 'Child' : 'Adult'}
      </Badge>
    ),
  }),
  columnHelper.accessor('familyName', {
    header: headerWithSort('Family'),
    size: 140,
  }),
  columnHelper.accessor('subject', {
    header: headerWithSort('Subject'),
    size: 130,
  }),
  columnHelper.accessor('tags', {
    header: 'Tags',
    size: 180,
    cell: ({ getValue }) => (
      <div className="flex flex-wrap gap-0.5">
        {getValue().map((tag: { id: string; name: string }) => (
          <Badge
            key={tag.id}
            variant="secondary"
            data-testid="student-type-badge"
            style={{ fontSize: 10 }}
          >
            {tag.name}
          </Badge>
        ))}
      </div>
    ),
  }),
  columnHelper.display({
    id: 'contact',
    size: 86,
    maxSize: 86,
    cell: ({ row }) => <StudentContact student={row.original} />,
  }),
  columnHelper.display({
    id: 'actions',
    size: 56,
    maxSize: 56,
    cell: ({ row }) => <StudentActions student={row.original} />,
  }),
]);

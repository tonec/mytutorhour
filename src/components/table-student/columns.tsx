import { createColumnHelper } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import { StudentListItem } from '@/services/db/student/mappers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { type DataTableFeatures } from '../data-table/data-table-features';
import { StudentActions } from './student-actions';
import { studentUrl } from './student-url';

const columnHelper = createColumnHelper<DataTableFeatures, StudentListItem>();

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
    enableSorting: false,
    enableHiding: false,
  }),
  columnHelper.accessor('displayName', {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row, getValue }) => (
      <Link href={studentUrl(row.original.id)} className="font-medium hover:underline">
        {getValue()}
      </Link>
    ),
  }),
  columnHelper.accessor('type', {
    header: 'Type',
    size: 100,
    cell: ({ getValue }) => (
      <Badge variant="secondary" data-testid="student-type-badge">
        {getValue() === 'child' ? 'Child' : 'Adult'}
      </Badge>
    ),
  }),
  columnHelper.accessor('familyName', {
    header: 'Family',
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
  // columnHelper.accessor('tags', {
  //   header: 'Tags',
  // }),
  columnHelper.display({
    id: 'actions',
    cell: ({ row }) => <StudentActions student={row.original} />,
  }),
]);

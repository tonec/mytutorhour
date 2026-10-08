import { TableHead, TableHeader, TableRow } from '../ui/table';
import { StudentReactTable } from './table-types';

export function StudentTableHeader({ table }: { table: StudentReactTable }) {
  return (
    <TableHeader className="bg-background sticky top-0 z-10 grid">
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id} className="flex w-full">
          {headerGroup.headers.map((header) => (
            <TableHead
              key={header.id}
              className="flex shrink-0 items-center justify-start"
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

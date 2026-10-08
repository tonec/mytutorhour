import type { ReactTable } from '@tanstack/react-table';
import type { StudentListItem } from '@/services/db/student/mappers';
import type { DataTableFeatures } from '../data-table/data-table-features';

export type StudentReactTable = ReactTable<DataTableFeatures, StudentListItem>;

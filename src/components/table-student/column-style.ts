import type { CSSProperties } from 'react';

interface SizedColumn {
  getSize: () => number;
  columnDef: { maxSize?: number };
}

// `size` is the column's minimum width; spare space is shared out in proportion to it. Columns
// with a `maxSize` stop growing there, so fixed-width columns set `maxSize` equal to `size`.
export function columnStyle(column: SizedColumn): CSSProperties {
  const size = column.getSize();
  return { flex: `${size} 0 ${size}px`, maxWidth: column.columnDef.maxSize };
}

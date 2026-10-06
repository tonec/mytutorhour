'use client';

import { usePathname } from 'next/navigation';

export function PageHeading() {
  const path = usePathname();

  console.log('path', path);

  return (
    <div>
      <h2>dsdsd</h2>
    </div>
  );
}

'use client';

import { getTitleByUrl } from '@/config/routes';
import { usePathname } from 'next/navigation';
import { Separator } from '../ui/separator';

export function PageHeading() {
  const path = usePathname();
  const title = getTitleByUrl(path);

  return (
    <div>
      <div className="text-muted-foreground px-4 py-3">
        <h1 className="text-sm font-medium">{title}</h1>
      </div>
      <Separator />
    </div>
  );
}

'use client';

import { getTitleByUrl } from '@/config/routes';
import { usePathname } from 'next/navigation';
import { HeaderActions } from '../app-header-actions/header-actions';
import { Separator } from '../ui/separator';

export function AppHeader() {
  const path = usePathname();
  const title = getTitleByUrl(path);

  return (
    <div className="display-none invisible md:visible md:block">
      <div className="text-muted-foreground flex items-center justify-between px-4 py-3">
        <h1 className="text-sm font-medium">{title}</h1>
        <HeaderActions />
      </div>
      <Separator />
    </div>
  );
}

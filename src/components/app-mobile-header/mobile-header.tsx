'use client';

import { getTitleByUrl } from '@/config/routes';
import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { HeaderActions } from '../app-header-actions/header-actions';
import { Button } from '../ui/button';
import { useSidebar } from '../ui/sidebar';

export function AppMobileHeader() {
  const path = usePathname();
  const title = getTitleByUrl(path);
  const { toggleSidebar } = useSidebar();

  const handleToggleSidebar = () => {
    toggleSidebar();
  };

  return (
    <header className="md:display-none bg-background fixed top-0 right-0 left-0 z-1000 h-10 md:invisible md:absolute">
      <div className="flex h-10 items-center justify-between">
        <Button onClick={handleToggleSidebar} variant="ghost" size="icon">
          <Menu />
        </Button>
        <h1 className="text-muted-foreground text-sm font-medium">{title}</h1>
        <HeaderActions />
      </div>
    </header>
  );
}

'use client';

import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SidebarHeader, useSidebar } from '@/components/ui/sidebar';
import { Logo } from './logo';

export function AppSidebarHeader() {
  const { toggleSidebar } = useSidebar();

  const handleToggleSidebar = () => {
    toggleSidebar();
  };

  return (
    <SidebarHeader className={cn('flex flex-row items-center justify-between md:pt-3.5')}>
      <a className="-mb-1 ml-2 flex items-center gap-2" href="#">
        <Logo className="h-8 w-8" />
      </a>
      <Button onClick={handleToggleSidebar} variant="ghost" size="icon">
        <Menu />
      </Button>
    </SidebarHeader>
  );
}

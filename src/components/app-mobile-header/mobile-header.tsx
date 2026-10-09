'use client';

import { sampleNotifications } from '@/config/sampleNotifications';
import { Menu } from 'lucide-react';
import { Notifications } from '../app-sidebar/notifications/notifications';
import { Button } from '../ui/button';
import { useSidebar } from '../ui/sidebar';

export function AppMobileHeader() {
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
        <Notifications notifications={sampleNotifications} />
      </div>
    </header>
  );
}

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
    <header className="md:display-none align-center relative flex justify-between p-2 md:invisible md:absolute">
      <Button onClick={handleToggleSidebar} variant="ghost" size="icon">
        <Menu />
      </Button>
      <h1>Icon</h1>
      <Notifications notifications={sampleNotifications} />
    </header>
  );
}

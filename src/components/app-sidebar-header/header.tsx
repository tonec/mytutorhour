'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/app-sidebar-header/logo';
import { Notifications } from '@/components/notifications/notifications';
import { useSidebar } from '@/components/ui/sidebar';
import { SidebarHeader, SidebarTrigger } from '@/components/ui/sidebar';

const sampleNotifications = [
  {
    id: '1',
    avatar: '/avatars/01.png',
    fallback: 'OM',
    text: 'New order received.',
    time: '10m ago',
  },
  {
    id: '2',
    avatar: '/avatars/02.png',
    fallback: 'JL',
    text: 'Server upgrade completed.',
    time: '1h ago',
  },
  {
    id: '3',
    avatar: '/avatars/03.png',
    fallback: 'HH',
    text: 'New user signed up.',
    time: '2h ago',
  },
];

export function AppSidebarHeader() {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <SidebarHeader
      className={cn(
        'flex md:pt-3.5',
        isCollapsed
          ? 'flex-row items-center justify-between gap-y-4 md:flex-col md:items-start md:justify-start'
          : 'flex-row items-center justify-between'
      )}
    >
      <a className="-mb-1 ml-2 flex items-center gap-2" href="#">
        <Logo className="h-8 w-8" />
      </a>

      <motion.div
        animate={{ opacity: 1 }}
        className={cn(
          'flex items-center gap-2',
          isCollapsed ? 'flex-row md:flex-col-reverse' : 'flex-row'
        )}
        initial={{ opacity: 0 }}
        key={isCollapsed ? 'header-collapsed' : 'header-expanded'}
        transition={{ duration: 0.8 }}
      >
        <Notifications notifications={sampleNotifications} />
        <SidebarTrigger />
      </motion.div>
    </SidebarHeader>
  );
}

'use client';

import { navigationItems } from '@/config/navigation-items';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/app-sidebar/logo';
import DashboardNavigation from '@/components/app-sidebar/nav-main';
import { NotificationsPopover } from '@/components/app-sidebar/nav-notifications';
import { TeamSwitcher } from '@/components/app-sidebar/team-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

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

const teams = [
  { id: '1', name: 'Alpha Inc.', logo: Logo, plan: 'Free' },
  { id: '2', name: 'Beta Corp.', logo: Logo, plan: 'Free' },
  { id: '3', name: 'Gamma Tech', logo: Logo, plan: 'Free' },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon" variant="inset">
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
          <NotificationsPopover notifications={sampleNotifications} />
          <SidebarTrigger />
        </motion.div>
      </SidebarHeader>
      <SidebarContent className="gap-4 px-2 py-4">
        <DashboardNavigation routes={navigationItems} />
      </SidebarContent>
      <SidebarFooter className="px-2">
        <TeamSwitcher teams={teams} />
      </SidebarFooter>
    </Sidebar>
  );
}

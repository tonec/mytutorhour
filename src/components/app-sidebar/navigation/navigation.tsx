'use client';

import { usePathname } from 'next/navigation';
import { SidebarMenu, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { NavigationMenuItem } from './menu-item';
import { NavigationMenuItemCollapsible } from './menu-item-collapsible';
import type { NavigationItem } from './types';
import { isPathActive } from './utils';

export function Navigation({ routes }: { routes: NavigationItem[] }) {
  const { state } = useSidebar();
  const pathname = usePathname();
  const isCollapsed = state === 'collapsed';

  return (
    <SidebarMenu>
      {routes.map((route) => {
        return (
          <SidebarMenuItem key={route.id}>
            {route.type === 'prime' ? (
              <NavigationMenuItem
                isActive={isPathActive(pathname, route.link)}
                isCollapsed={isCollapsed}
                route={route}
              />
            ) : (
              <NavigationMenuItemCollapsible
                isCollapsed={isCollapsed}
                pathname={pathname}
                route={route}
              />
            )}
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

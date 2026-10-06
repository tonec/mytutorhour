'use client';

import { SidebarMenu, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { NavigationMenuItem } from './menu-item';
import { NavigationMenuItemCollapsible } from './menu-item-collapsible';
import type { Route } from './types';

export function Navigation({ routes }: { routes: Route[] }) {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <SidebarMenu>
      {routes.map((route) => {
        return (
          <SidebarMenuItem key={route.id}>
            {route.type === 'prime' ? (
              <NavigationMenuItem isCollapsed={isCollapsed} route={route} />
            ) : (
              <NavigationMenuItemCollapsible isCollapsed={isCollapsed} route={route} />
            )}
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

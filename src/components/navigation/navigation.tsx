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
        const hasSubRoutes = !!route.subs?.length;

        return (
          <SidebarMenuItem key={route.id}>
            {hasSubRoutes ? (
              <NavigationMenuItemCollapsible
                isCollapsed={isCollapsed}
                hasSubRoutes={hasSubRoutes}
                route={route}
              />
            ) : (
              <NavigationMenuItem isCollapsed={isCollapsed} route={route} />
            )}
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

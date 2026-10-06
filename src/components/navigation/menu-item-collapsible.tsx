import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuItem as SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import type { RouteWithSubRoutes } from './types';
import { isPathActive } from './utils';

type Props = {
  isCollapsed: boolean;
  pathname: string;
  route: RouteWithSubRoutes;
};

export function NavigationMenuItemCollapsible({ isCollapsed, pathname, route }: Props) {
  const hasActiveChild =
    route.subs?.some((subRoute) => isPathActive(pathname, subRoute.link)) ?? false;
  const [openCollapsible, setOpenCollapsible] = useState<string | null>(
    hasActiveChild ? route.id : null
  );

  const isOpen = !isCollapsed && openCollapsible === route.id;

  return (
    <Collapsible
      className="w-full"
      onOpenChange={(open) => setOpenCollapsible(open ? route.id : null)}
      open={isOpen}
    >
      <CollapsibleTrigger
        render={
          <SidebarMenuButton
            className={cn(
              'text-muted-foreground flex w-full items-center rounded-lg px-2 transition-colors',
              isCollapsed && 'justify-center'
            )}
            isActive={hasActiveChild}
          />
        }
      >
        {route.icon}

        {!isCollapsed && <span className="ml-2 flex-1 text-sm font-medium">{route.title}</span>}

        {!isCollapsed && (
          <span className="ml-auto">
            {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </span>
        )}
      </CollapsibleTrigger>

      {!isCollapsed && (
        <CollapsibleContent>
          <SidebarMenuSub className="my-1 ml-3.5">
            {route.type === 'sub' &&
              route.subs?.map((subRoute) => {
                const isActive = isPathActive(pathname, subRoute.link);

                return (
                  <SidebarMenuSubItem className="h-auto" key={`${route.id}-${subRoute.title}`}>
                    <SidebarMenuSubButton
                      className="text-muted-foreground flex items-center rounded-md px-4 py-1.5 text-sm font-medium"
                      isActive={isActive}
                      render={
                        <Link
                          aria-current={isActive ? 'page' : undefined}
                          href={subRoute.link}
                          prefetch={true}
                        />
                      }
                    >
                      {subRoute.title}
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                );
              })}
          </SidebarMenuSub>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}

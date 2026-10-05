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
import type { Route } from './types';

type Props = {
  isCollapsed: boolean;
  route: Route;
  hasSubRoutes: boolean;
};

export function NavigationMenuItemCollapsible({ isCollapsed, route, hasSubRoutes }: Props) {
  const [openCollapsible, setOpenCollapsible] = useState<string | null>(null);

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
              'flex w-full items-center rounded-lg px-2 transition-colors',
              isOpen
                ? 'bg-sidebar-muted text-foreground'
                : 'text-muted-foreground hover:bg-sidebar-muted hover:text-foreground',
              isCollapsed && 'justify-center'
            )}
          />
        }
      >
        {route.icon}

        {!isCollapsed && <span className="ml-2 flex-1 text-sm font-medium">{route.title}</span>}

        {!isCollapsed && hasSubRoutes && (
          <span className="ml-auto">
            {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </span>
        )}
      </CollapsibleTrigger>

      {!isCollapsed && (
        <CollapsibleContent>
          <SidebarMenuSub className="my-1 ml-3.5">
            {route.subs?.map((subRoute) => (
              <SidebarMenuSubItem className="h-auto" key={`${route.id}-${subRoute.title}`}>
                <SidebarMenuSubButton
                  render={
                    <Link
                      className="text-muted-foreground hover:bg-sidebar-muted hover:text-foreground flex items-center rounded-md px-4 py-1.5 text-sm font-medium"
                      href={subRoute.link}
                      prefetch={true}
                    />
                  }
                >
                  {subRoute.title}
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}

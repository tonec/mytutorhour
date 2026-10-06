import Link from 'next/link';
import { cn } from '@/lib/utils';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { RouteWithoutSubRoutes } from './types';

type Props = {
  isCollapsed: boolean;
  route: RouteWithoutSubRoutes;
};

export function NavigationMenuItem({ isCollapsed, route }: Props) {
  return (
    <SidebarMenuButton
      tooltip={route.title}
      render={
        <Link
          className={cn(
            'text-muted-foreground hover:bg-sidebar-muted hover:text-foreground flex items-center rounded-lg px-2 transition-colors',
            isCollapsed && 'justify-center'
          )}
          href={route.link}
          prefetch={true}
        />
      }
    >
      {route.icon}

      {!isCollapsed && <span className="ml-2 text-sm font-medium">{route.title}</span>}
    </SidebarMenuButton>
  );
}

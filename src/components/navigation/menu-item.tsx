import Link from 'next/link';
import { cn } from '@/lib/utils';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { RouteWithoutSubRoutes } from './types';

type Props = {
  isActive: boolean;
  isCollapsed: boolean;
  route: RouteWithoutSubRoutes;
};

export function NavigationMenuItem({ isActive, isCollapsed, route }: Props) {
  return (
    <SidebarMenuButton
      className={cn(
        'text-muted-foreground flex items-center rounded-lg px-2 transition-colors',
        isCollapsed && 'justify-center'
      )}
      isActive={isActive}
      tooltip={route.title}
      render={
        <Link aria-current={isActive ? 'page' : undefined} href={route.link} prefetch={true} />
      }
    >
      {route.icon}

      {!isCollapsed && <span className="ml-2 text-sm font-medium">{route.title}</span>}
    </SidebarMenuButton>
  );
}

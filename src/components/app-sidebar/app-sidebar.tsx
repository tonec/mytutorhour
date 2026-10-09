import { navigationItems } from '@/config/navigation-items';
import { Sidebar, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';
import { AppSidebarHeader } from './header/header';
import { Navigation } from './navigation/navigation';
import { UserMenu } from './user-menu/user-menu';

export function DashboardSidebar() {
  return (
    <Sidebar variant="inset">
      <AppSidebarHeader />

      <SidebarContent className="gap-4 px-2 py-4">
        <Navigation routes={navigationItems} />
      </SidebarContent>

      <SidebarFooter className="px-2">
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  );
}

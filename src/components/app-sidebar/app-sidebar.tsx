import { navigationItems } from '@/config/navigation-items';
import { Sidebar, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';
import { UserMenu } from '@/components/user-menu/user-menu';
import { AppSidebarHeader } from '../app-sidebar-header/header';
import { Navigation } from '../navigation/navigation';

export function DashboardSidebar() {
  return (
    <Sidebar collapsible="icon" variant="inset">
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

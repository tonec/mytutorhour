import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';
import { UserMenuContent } from './content';
import { UserMenuTrigger } from './trigger';

export async function UserMenu() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <UserMenuTrigger />
          <UserMenuContent />
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

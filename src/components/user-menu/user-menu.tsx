import { createClient } from '@/lib/supabase/server';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';
import { UserMenuContent } from './content';
import { UserMenuTrigger } from './trigger';

export async function UserMenu() {
  const supabase = await createClient();

  const userPromise = supabase.auth.getUser();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <UserMenuTrigger userPromise={userPromise} />
          <UserMenuContent />
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

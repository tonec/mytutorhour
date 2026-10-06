import { Ellipsis, User } from 'lucide-react';
import { DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarMenuButton } from '@/components/ui/sidebar';

export function UserMenuTrigger() {
  return (
    <DropdownMenuTrigger
      render={
        <SidebarMenuButton
          className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
          size="lg"
        />
      }
    >
      <div className="bg-background text-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
        <User className="size-4" />
      </div>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold">{'Name'}</span>
      </div>
      <Ellipsis className="ml-auto" />
    </DropdownMenuTrigger>
  );
}

import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export function UserMenuContent() {
  return (
    <DropdownMenuContent
      className="w-(--anchor-width) min-w-56 rounded-lg"
      side="top"
      sideOffset={4}
    >
      <DropdownMenuItem className="gap-2 p-2">Settings</DropdownMenuItem>
      <DropdownMenuItem className="gap-2 p-2">Invite & manage members</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem className="gap-2 p-2">Download desktop app</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem className="gap-2 p-2">Log out</DropdownMenuItem>
    </DropdownMenuContent>
  );
}

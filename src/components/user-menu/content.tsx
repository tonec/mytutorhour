import { Plus } from 'lucide-react';
import { Logo } from '@/components/app-sidebar-header/logo';
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu';

const teams = [
  { id: '1', name: 'Alpha Inc.', logo: Logo, plan: 'Free' },
  { id: '2', name: 'Beta Corp.', logo: Logo, plan: 'Free' },
  { id: '3', name: 'Gamma Tech', logo: Logo, plan: 'Free' },
];

export function UserMenuContent() {
  return (
    <DropdownMenuContent
      className="w-(--anchor-width) min-w-56 rounded-lg"
      side="top"
      sideOffset={4}
    >
      <DropdownMenuGroup>
        <DropdownMenuLabel className="text-muted-foreground text-xs">Teams</DropdownMenuLabel>
      </DropdownMenuGroup>
      {teams.map((team, index) => (
        <DropdownMenuItem className="gap-2 p-2" key={team.name}>
          <div className="flex size-6 items-center justify-center rounded-sm border">
            <team.logo className="size-4 shrink-0" />
          </div>
          {team.name}
          <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
        </DropdownMenuItem>
      ))}
      <DropdownMenuSeparator />
      <DropdownMenuItem className="gap-2 p-2">
        <div className="bg-background flex size-6 items-center justify-center rounded-md border">
          <Plus className="size-4" />
        </div>
        <div className="text-muted-foreground font-medium">Add team</div>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}

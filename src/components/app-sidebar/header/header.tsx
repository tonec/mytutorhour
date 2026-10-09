import { cn } from '@/lib/utils';
import { SidebarHeader } from '@/components/ui/sidebar';
import { Logo } from './logo';

export function AppSidebarHeader() {
  return (
    <SidebarHeader className={cn('flex flex-row items-center justify-between md:pt-3.5')}>
      <a className="-mb-1 ml-2 flex items-center gap-2" href="#">
        <Logo className="h-8 w-8" />
      </a>
    </SidebarHeader>
  );
}

import { PropsWithChildren } from 'react';
import { AppHeader } from '@/components/app-header/header';
import { AppMobileHeader } from '@/components/app-mobile-header/mobile-header';
import { DashboardSidebar } from '@/components/app-sidebar/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function PrivateLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
      <div className="relative flex h-dvh w-full flex-col md:flex-row">
        <AppMobileHeader />
        <DashboardSidebar />
        <SidebarInset className="mt-10 flex flex-col md:mt-0 md:peer-data-[variant=inset]:mb-6">
          <AppHeader />
          <div className="h-full w-full">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

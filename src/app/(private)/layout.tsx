import { PropsWithChildren } from 'react';
import { DashboardSidebar } from '@/components/app-sidebar/app-sidebar';
import { PageHeader } from '@/components/page-header/header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function PrivateLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
      <div className="relative flex h-dvh w-full">
        <DashboardSidebar />
        <SidebarInset className="flex flex-col md:peer-data-[variant=inset]:mb-6">
          <PageHeader />
          <div className="h-full w-full">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

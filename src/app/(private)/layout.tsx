import { PropsWithChildren } from 'react';
import { DashboardSidebar } from '@/components/app-sidebar/app-sidebar';
import { PageHeading } from '@/components/page-heading/heading';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function PrivateLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
      <div className="relative flex h-dvh w-full">
        <DashboardSidebar />
        <SidebarInset className="flex flex-col">
          <PageHeading />
          <div>{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

import { PropsWithChildren } from 'react';
import { AppHeader } from '@/components/app-header/header';
import { AppMobileHeader } from '@/components/app-mobile-header/mobile-header';
import { AppSidebar } from '@/components/app-sidebar/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function PrivateLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
      <AppMobileHeader />
      <AppSidebar />
      <SidebarInset className="min-w-0 shrink grow">
        <AppHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

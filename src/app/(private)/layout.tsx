import { DashboardSidebar } from '@/components/app-sidebar/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function Sidebar03() {
  return (
    <SidebarProvider>
      <div className="relative flex h-dvh w-full">
        <DashboardSidebar />
        <SidebarInset className="flex flex-col">
          <p>dsdsdsd</p>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

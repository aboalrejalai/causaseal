import { AppSidebar } from "@/components/causaseal/app-sidebar"
import { SiteHeader } from "@/components/causaseal/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "280px",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset className="min-w-0 overflow-x-hidden">
        <SiteHeader />
        <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden p-4 md:p-6">
          <div className="mx-auto flex w-full min-w-0 max-w-[var(--content-max-width)] flex-col gap-6">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

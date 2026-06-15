import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'

import { cn } from '@/shared/utils/cn'
import { Sidebar } from '@/features/dashboard/components/Sidebar'
import { Navbar } from '@/features/dashboard/components/Navbar'

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen bg-bg">
      <aside
        className={cn(
          'hidden shrink-0 border-r border-border bg-bg transition-all duration-300 lg:block',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className="flex h-full flex-col">
          <Sidebar collapsed={sidebarCollapsed} />
          <button
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            className="flex items-center justify-center border-t border-border py-4 text-text-secondary transition-colors hover:bg-surface hover:text-text"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        </div>
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-8 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

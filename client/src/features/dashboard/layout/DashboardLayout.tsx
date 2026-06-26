import { useState, useCallback, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen, Bot } from 'lucide-react'

import { cn } from '@/shared/utils/cn'
import { Sidebar } from '@/features/dashboard/components/Sidebar'
import { Navbar } from '@/features/dashboard/components/Navbar'
import { MoodModal } from '@/features/mental-health/components/MoodModal'
import { SaludSuggestion } from '@/features/mental-health/components/SaludSuggestion'
import { OrientationDialog } from '@/features/ai-orientation/components/OrientationDialog'
import { useMentalHealth } from '@/features/mental-health/hooks/useMentalHealth'
import type { MoodValue } from '@/features/mental-health/types/mental-health.types'

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [moodModalOpen, setMoodModalOpen] = useState(false)
  const [orientationOpen, setOrientationOpen] = useState(false)
  const { saveMood, aiSuggestion, clearAiSuggestion, todayMood } = useMentalHealth()

  useEffect(() => {
    if (!todayMood) {
      const timer = setTimeout(() => setMoodModalOpen(true), 0)
      return () => clearTimeout(timer)
    }
  }, [todayMood])

  const handleMoodSelect = useCallback(
    async (mood: MoodValue) => {
      await saveMood(mood)
      setMoodModalOpen(false)
    },
    [saveMood, setMoodModalOpen],
  )

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

      <MoodModal open={moodModalOpen} onSelect={handleMoodSelect} />

      <SaludSuggestion
        response={aiSuggestion}
        open={aiSuggestion !== null}
        onClose={clearAiSuggestion}
      />

      <button
        onClick={() => setOrientationOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-primary shadow-lg transition-transform hover:scale-105 hover:shadow-xl active:scale-95"
        title="Orion — Orientación IA"
      >
        <Bot className="h-6 w-6 text-white" />
      </button>

      <OrientationDialog
        open={orientationOpen}
        onClose={() => setOrientationOpen(false)}
      />
    </div>
  )
}

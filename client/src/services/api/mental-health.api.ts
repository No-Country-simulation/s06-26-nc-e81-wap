import type { MoodEntry, MoodValue } from '@/features/mental-health/types/mental-health.types'

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

const MOCK_MOOD_ENTRIES: MoodEntry[] = [
  { id: '1', date: daysAgo(6), mood: 4, createdAt: daysAgo(6) },
  { id: '2', date: daysAgo(5), mood: 3, createdAt: daysAgo(5) },
  { id: '3', date: daysAgo(4), mood: 2, createdAt: daysAgo(4) },
  { id: '4', date: daysAgo(3), mood: 4, createdAt: daysAgo(3) },
  { id: '5', date: daysAgo(2), mood: 5, createdAt: daysAgo(2) },
  { id: '6', date: daysAgo(1), mood: 4, createdAt: daysAgo(1) },
]

export async function getMoodEntries(): Promise<MoodEntry[]> {
  const stored = localStorage.getItem('mental-health-entries')
  if (stored) {
    return Promise.resolve(JSON.parse(stored) as MoodEntry[])
  }
  return Promise.resolve(MOCK_MOOD_ENTRIES)
}

export async function saveMoodEntry(mood: MoodValue): Promise<MoodEntry> {
  const newEntry: MoodEntry = {
    id: crypto.randomUUID?.() ?? Date.now().toString(),
    date: getTodayStr(),
    mood,
    createdAt: new Date().toISOString(),
  }

  const stored = localStorage.getItem('mental-health-entries')
  const entries: MoodEntry[] = stored ? JSON.parse(stored) : MOCK_MOOD_ENTRIES
  const filtered = entries.filter((e) => e.date !== getTodayStr())
  filtered.push(newEntry)
  localStorage.setItem('mental-health-entries', JSON.stringify(filtered))
  localStorage.setItem('mental-health-last-checkin', getTodayStr())

  return Promise.resolve(newEntry)
}

import type { MentorshipData } from '@/features/mentorship/types/mentorship.types'

const MOCK_MENTORSHIP: MentorshipData = {
  notifications: [
    {
      id: 'n1',
      message: 'Carlos Mendoza te invitó a una práctica de Frontend',
      time: 'Hace 2 horas',
      read: false,
      type: 'invite',
    },
    {
      id: 'n2',
      message: 'Tu sesión con Ana López es mañana a las 10:00',
      time: 'Hace 5 horas',
      read: false,
      type: 'reminder',
    },
    {
      id: 'n3',
      message: 'Taller de Liderazgo confirmado para el sábado',
      time: 'Ayer',
      read: true,
      type: 'update',
    },
  ],
  upcomingSessions: [
    {
      id: 's1',
      title: 'Práctica de Frontend',
      mentorName: 'Carlos Mendoza',
      dateTime: 'Jueves 18 · 15:00',
      status: 'confirmed',
    },
    {
      id: 's2',
      title: 'Revisión de CV',
      mentorName: 'Ana López',
      dateTime: 'Viernes 19 · 10:00',
      status: 'pending',
    },
    {
      id: 's3',
      title: 'Workshop de Liderazgo',
      mentorName: 'Pedro Ramírez',
      dateTime: 'Sábado 20 · 09:00',
      status: 'confirmed',
    },
  ],
  progress: {
    sessionsCompleted: 8,
    totalHours: 14,
    satisfactionRate: 92,
    upcomingCount: 3,
  },
  mentors: [
    {
      id: 'm1',
      name: 'Carlos Mendoza',
      role: 'Senior Frontend Engineer',
      company: 'Google',
      avatarUrl: 'https://cdn.prod.website-files.com/632a406bba53c60f9ca58a26/65cff24e18a33e51eda1fc67_Blog%20-%20Fotografi%CC%81a%20de%20marca%20personal%20para%20tu%20sitio%20web%20y%20material%20promocional_TT.jpg',
      areas: ['Frontend', 'React', 'Arquitectura'],
      availableSlots: 3,
    },
    {
      id: 'm2',
      name: 'Ana López',
      role: 'Tech Recruiter',
      company: 'LinkedIn',
      avatarUrl: 'https://cdn.prod.website-files.com/632a406bba53c60f9ca58a26/63c6cce74a196cc7d68e3bc5_1x1_Banner%20Ideas%20para%20tu%20fotografi%CC%81a%20de%20retrato%20ejecutivo%20y%20perfil%20de%20Linkedin.jpg',
      areas: ['CV', 'Entrevistas', 'Marca Personal'],
      availableSlots: 5,
    },
    {
      id: 'm3',
      name: 'Pedro Ramírez',
      role: 'Engineering Manager',
      company: 'Spotify',
      avatarUrl: 'https://images.ctfassets.net/h6goo9gw1hh6/2sNZtFAWOdP1lmQ33VwRN3/e40b6ea6361a1abe28f32e7910f63b66/1-intro-photo-final.jpg?w=1200&h=992&fl=progressive&q=70&fm=jpg',
      areas: ['Liderazgo', 'Backend', 'Mentoría'],
      availableSlots: 1,
    },
    {
      id: 'm4',
      name: 'María García',
      role: 'Data Scientist',
      company: 'Netflix',
      avatarUrl: 'https://media.licdn.com/dms/image/v2/D4E03AQE8Tb2Q5cNuRA/profile-displayphoto-shrink_400_400/B4EZW6L2JMGYAg-/0/1742585423042?e=2147483647&v=beta&t=PQVh6BZJnTzqpt_zsin8wed2GbQUDHaO88QQL287yPY',
      areas: ['Data Science', 'Python', 'ML'],
      availableSlots: 2,
    },
  ],
  tip: {
    text: 'No necesitas saberlo todo para empezar. Los mejores mentores buscan potencial, no perfección. Muestra tu curiosidad y ganas de aprender.',
    author: 'App BiT',
  },
}

export async function getMentorshipData(): Promise<MentorshipData> {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_MENTORSHIP), 1500))
}

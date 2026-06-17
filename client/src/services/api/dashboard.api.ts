import type { DashboardData } from '@/features/dashboard/types/dashboard.types'

const MOCK_DASHBOARD: DashboardData = {
  userName: 'Jhon Doe',
  highlight: {
    title: 'Próxima experiencia: Workshop de Liderazgo',
    description: 'Únete a la sesión con mentores de la industria. Conoce nuevas perspectivas y expande tu red.',
    daysRemaining: 5,
    ctaLink: '/dashboard/experiencias',
    isEmpty: false,
  },
  widgets: [
    {
      domain: 'formacion',
      value: '3 cursos en progreso',
      icon: 'Brain',
      ctaLink: '/dashboard/formacion',
      isEmpty: false,
    },
    {
      domain: 'empleabilidad',
      value: '2 postulaciones activas',
      icon: 'IdCard',
      ctaLink: '/dashboard/empleabilidad',
      isEmpty: false,
    },
    {
      domain: 'mentorias',
      value: '1 próxima sesión',
      icon: 'UsersRound',
      ctaLink: '/dashboard/mentorias',
      isEmpty: false,
    },
    {
      domain: 'salud-mental',
      value: 'Racha de 7 días',
      icon: 'Origami',
      ctaLink: '/dashboard/salud-mental',
      isEmpty: false,
    },
  ],
  lists: [
    {
      domain: 'empleabilidad',
      isEmpty: false,
      items: [
        {
          id: '1',
          title: 'Frontend Developer',
          subtitle: 'TechCorp · Postulado hace 2 días',
          status: 'En revisión',
          statusVariant: 'warning',
          link: '/dashboard/empleabilidad',
        },
        {
          id: '2',
          title: 'Data Analyst',
          subtitle: 'DataWise · Postulado hace 5 días',
          status: 'Postulado',
          statusVariant: 'info',
          link: '/dashboard/empleabilidad',
        },
        {
          id: '3',
          title: 'DevOps Engineer',
          subtitle: 'CloudBase · Postulado hace 1 día',
          status: 'Entrevista agendada',
          statusVariant: 'success',
          link: '/dashboard/empleabilidad',
        },
        {
          id: '4',
          title: 'Backend Developer',
          subtitle: 'SaaS Labs · Postulado hace 8 días',
          status: 'Rechazado',
          statusVariant: 'default',
          link: '/dashboard/empleabilidad',
        },
      ],
    },
    {
      domain: 'formacion',
      isEmpty: false,
      items: [
        {
          id: '1',
          title: 'Sistemas Distribuidos Avanzados',
          subtitle: 'Completado · Marzo 2026',
          status: 'Certificado',
          statusVariant: 'success',
          link: '/dashboard/formacion',
        },
        {
          id: '2',
          title: 'Introducción a Kubernetes',
          subtitle: 'Completado · Febrero 2026',
          status: 'Certificado',
          statusVariant: 'success',
          link: '/dashboard/formacion',
        },
        {
          id: '3',
          title: 'Arquitectura Cloud',
          subtitle: 'Completado · Enero 2026',
          status: 'Certificado',
          statusVariant: 'success',
          link: '/dashboard/formacion',
        },
        {
          id: '4',
          title: 'Docker y Contenedores',
          subtitle: 'Completado · Diciembre 2025',
          status: 'Certificado',
          statusVariant: 'success',
          link: '/dashboard/formacion',
        },
      ],
    },
    {
      domain: 'mentorias',
      isEmpty: false,
      items: [
        {
          id: '1',
          title: 'Sesión con Carlos Mendoza',
          subtitle: 'Jueves 18 · 15:00',
          status: 'Confirmado',
          statusVariant: 'success',
          link: '/dashboard/mentorias',
        },
        {
          id: '2',
          title: 'Revisión de CV con Ana López',
          subtitle: 'Viernes 19 · 10:00',
          status: 'Pendiente',
          statusVariant: 'warning',
          link: '/dashboard/mentorias',
        },
        {
          id: '3',
          title: 'Workshop de Liderazgo',
          subtitle: 'Sábado 20 · 09:00',
          status: 'Inscrito',
          statusVariant: 'info',
          link: '/dashboard/mentorias',
        },
      ],
    },
  ],
}

export async function getDashboardData(): Promise<DashboardData> {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_DASHBOARD), 2000))
}

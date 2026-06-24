import type { ResumeData, Application, Training, Vacancy } from '@/features/employability/types/employability.types'

const MOCK_RESUME: ResumeData = {
  atsScore: 78,
  readability: 'Alta',
  keywords: 12,
  impact: 'Óptimo',
  improvements: [
    {
      id: '1',
      type: 'error',
      title: 'Cuantifica tus Logros',
      description: 'Agrega métricas a tu experiencia en Tech Solutions. Usa porcentajes o números concretos.',
    },
    {
      id: '2',
      type: 'info',
      title: 'Habilidades Técnicas Faltantes',
      description: 'Considera agregar Kubernetes y GraphQL según tu historial de proyectos actual.',
    },
  ],
}

const MOCK_APPLICATIONS: Application[] = [
  {
    id: '1',
    title: 'Ingeniero Frontend Senior',
    company: 'Google • Zurich, CH',
    status: 'interview',
    date: 'Próximo: Entrevista Presencial (12 de Junio)',
  },
  {
    id: '2',
    title: 'Desarrollador Full Stack',
    company: 'Stripe • Remoto',
    status: 'applied',
    date: 'Enviado hace 4 días',
  },
  {
    id: '3',
    title: 'Gerente de Ingeniería',
    company: 'Airbnb • Berlín, DE',
    status: 'closed',
    date: 'Posición cubierta',
  },
]

const MOCK_TRAININGS: Training[] = [
  {
    id: '1',
    title: 'Marcos de Comportamiento',
    description: 'Domina el método STAR para preguntas de liderazgo y resolución de conflictos.',
    tag: 'Nuevo',
    duration: '45 min • Intermedio',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpxL7AxNp1rStRzqfL8g9nmM-34NM24567u2nTLwhIZ47meorCbxuitItymfdYgVUPWgrtc_B23qFJ0eXnWlcpTeAwd5CFaOA155T2mGxugN54ylGnloSWp6SBZOYCigaF6nmmICIE-Qo4ASM9klHOrltagQWKl675RYTa68IZ3bCHqndlJKcpDDzoETFa0Ltg3b5wM0-FIFGevXrqomUgxfydMITnjRJaiUK2D4WtoQZP4UslpuKmW4Lbcb1SMJ-D64nQOorWsIse',
  },
  {
    id: '2',
    title: 'Inmersión en Diseño de Sistemas',
    description: 'Patrones de arquitectura para sistemas distribuidos de alta disponibilidad.',
    duration: '120 min • Avanzado',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB29LvZRqY4TXA61sv0zATVYEvN8eoLsgQxIrxl0JFBAW2Y54QkMyKohP2J652c_QIQy8rwiXDkd9GewLoSWCVITiP9y49XZVEJ-eQ2qKjfNwwuXp-xC6c4TXapJb6NsF65B7Lryf7k4uDH4WNlT29vj1tSA2artIqjS5R4LhPgu2r3gN4aoHASbOHainyRtSlTTPJSX8f3KTl631MoIvYYobnj2YuNkdZA3ID7FLcimc8TjvAtTrLyl4vuYuwhOZ2arKo4Mf_L-4Bf',
  },
  {
    id: '3',
    title: 'Ingeniería Frontend 101',
    description: 'Conceptos básicos de manipulación del DOM, ciclos de renderizado y optimización de rendimiento.',
    duration: '60 min • Principiante',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpfi-9zIKTla1trPicc65H2L408aqfKPrCRtFLIn5hyLjN0jc-pb7AxZjqTe8bURz1as87RrsUFKXPY08CC0RZitrSc9Mu7UZzA0LGib0lXOW6HAmUcv3Btvs9tx82RtDI8DSTesKVHm2U9Mc29DsxfWhbPC5bhhhBNcqoARB35v7L9PbZyOCOuIO1X-IUicha0DytjHHDofm_WjLGoekvFWRhx1I7Y6bRgWMLkqOrV4KORdDFHDOkU7NNjiZo8NAEY_D1MBhI1lNb',
  },
]

const MOCK_VACANCIES: Vacancy[] = [
  {
    id: '1',
    title: 'Desarrollador Frontend React',
    company: 'TechCorp',
    location: 'Remoto • LATAM',
    salary: '$45k - $65k',
    matchPercent: 72,
    missingSkills: ['GraphQL', 'Testing (Jest)'],
    tags: ['React', 'TypeScript', 'Remoto'],
  },
  {
    id: '2',
    title: 'Backend Engineer Node.js',
    company: 'FintechWave',
    location: 'São Paulo, BR',
    salary: '$50k - $75k',
    matchPercent: 65,
    missingSkills: ['Docker', 'Mensajería (RabbitMQ)'],
    tags: ['Node.js', 'PostgreSQL', 'Presencial'],
  },
  {
    id: '3',
    title: 'Full Stack Developer Jr',
    company: 'StartupLab',
    location: 'Remoto • BR',
    salary: '$25k - $35k',
    matchPercent: 88,
    missingSkills: [],
    tags: ['React', 'Python', 'Remoto', 'Jr'],
  },
  {
    id: '4',
    title: 'Data Analyst',
    company: 'DataDriven Inc',
    location: 'Buenos Aires, AR',
    salary: '$35k - $50k',
    matchPercent: 55,
    missingSkills: ['SQL Avanzado', 'Python (Pandas)', 'Power BI'],
    tags: ['SQL', 'Excel', 'Híbrido'],
  },
  {
    id: '5',
    title: 'Mobile Developer React Native',
    company: 'AppFlow',
    location: 'Remoto • LATAM',
    salary: '$40k - $60k',
    matchPercent: 78,
    missingSkills: ['Publicación App Store/Play'],
    tags: ['React Native', 'TypeScript', 'Remoto'],
  },
  {
    id: '6',
    title: 'DevOps Engineer',
    company: 'CloudScale',
    location: 'Ciudad de México, MX',
    salary: '$60k - $85k',
    matchPercent: 42,
    missingSkills: ['Terraform', 'CI/CD Avanzado', 'AWS', 'Kubernetes'],
    tags: ['AWS', 'Docker', 'Senior'],
  },
]

export async function getResumeData(): Promise<ResumeData> {
  return Promise.resolve(MOCK_RESUME)
}

export async function getApplications(): Promise<Application[]> {
  return Promise.resolve(MOCK_APPLICATIONS)
}

export async function getTrainings(): Promise<Training[]> {
  return Promise.resolve(MOCK_TRAININGS)
}

export async function getVacancies(): Promise<Vacancy[]> {
  return Promise.resolve(MOCK_VACANCIES)
}

import type { Course, StudyMaterial, Workshop, ProgressData } from '@/features/training/types/training.types'

const MOCK_COURSES: Course[] = [
  {
    id: 1,
    title: 'Infraestructura como Código',
    description: 'Domina Terraform y Ansible para aprovisionamiento automatizado en la nube en AWS y GCP.',
    tag: 'KUBERNETES',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7BMOAEs3he47CVemKqVIsvJyhHTOmykM1v3AoC3lGBlPWHHQNfOf8NEO3mPn6QFjwqdQMY_pZsZunZH3NZGbU32ZwJPrf49IkECDGXcJbxrncimczLrXw8ULjFMZqgENBPAYO1ichHhGJRYqmX02OuriSbcHVz3djWZwMBf0ZNxBmJZljyTLfeBP8nkIU8Rj0Likt6R8QmS1SIOJkdAAUlWirtuokBMkM0nLC6cAGchAx2QrWWpjHJMT7WHvc00MlgOrtse8s1pcx',
    duration: '24h content',
    hasInstructors: true,
  },
  {
    id: 2,
    title: 'Patrones de Concurrencia',
    description: 'Profundiza en asyncio, threading y multiprocesamiento para Python de alto rendimiento.',
    tag: 'PYTHON',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrvCwtmNNS6ilKcbxlTkv9ddgQRZMRhIVg2WFenrTpycRd_NY7ubgYoPtaimn8oCJWjWjS_hWdLWtirMP_nOAcyOB8uCaSFemHnM9sh6R6_FfH9vDFBDOqxubdM_nILRqgo3h8mpmoVuStTn2LHGo2h3j_UIV2sBMWR2KWM2dRx42Dq4Hp58OCvIZHllRgXspAEMurUPk_mPwYOOJlgLnSmUBV6vNnv9a9ac7QBsynpNt_jeViU8Iyi8nzwkxNMdfonmu2MaPM_LPQ',
    duration: '12h content',
    beginnerFriendly: true,
  },
  {
    id: 3,
    title: 'Codificación Defensiva',
    description: 'Implementación de estándares OWASP y escaneo de seguridad automatizado en pipelines CI/CD.',
    tag: 'SEGURIDAD',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5k0wN-FgL-1YkvBuUkwdpKVKImqh6hJJWUWYd6JonvNHZ4UigbqyoetOuAsqurpgUJpH3UQrTTRP7FyoKZ8cYiphpycSz-xx4XmMTj5_b4YAFZA1kfrTVzBabzoI7SCKI6kCRGPBrHMQfzIWHqi-ZowzZ7_emb_yqdSEfFY-lDtLnvpBJCuCPJ4YHhCEZQHjHStzsuStMt3bZ1zSzuy5Jf8ahgZTzalybkuDCVp95xI3S2adlycCKJfDWUTwZh4Tku_NXi0x8vCxm',
    duration: '18h content',
    rating: 4,
  },
]

const MOCK_MATERIALS: StudyMaterial[] = [
  { id: 1, icon: 'description', title: 'Guía_Sistemas_Distribuidos.pdf', size: 'PDF • 12.4 MB' },
  { id: 2, icon: 'folder_zip', title: 'Ejercicios_Prácticos_Vol3.zip', size: 'Archivo • 45.0 MB' },
  { id: 3, icon: 'movie', title: 'Archivo_Conferencias_2023.mp4', size: 'Video • 1.2 GB' },
]

const MOCK_WORKSHOPS: Workshop[] = [
  {
    id: 1,
    title: 'Q&A: Optimización de Consultas en Base de Datos',
    description: 'Únete a la Ingeniera Principal Sarah Chen para una inmersión profunda en la optimización de rendimiento de Postgres.',
    time: 'MAÑANA • 14:00 GMT',
    isUpcoming: true,
    attendeeCount: 42,
  },
  {
    id: 2,
    title: 'Taller: Redes de Confianza Cero',
    description: 'Una sesión práctica sobre la implementación de perímetros de red seguros en entornos de nube.',
    time: 'JUEVES • 10:00 GMT',
    isUpcoming: false,
  },
]

const MOCK_PROGRESS: ProgressData = {
  completedPercent: 68,
  completedModules: 12,
  totalModules: 18,
  dailyStreak: 14,
  learningHours: 32.5,
  badgesEarned: 8,
}

export async function getCourses(): Promise<Course[]> {
  return Promise.resolve(MOCK_COURSES)
}

export async function getMaterials(): Promise<StudyMaterial[]> {
  return Promise.resolve(MOCK_MATERIALS)
}

export async function getWorkshops(): Promise<Workshop[]> {
  return Promise.resolve(MOCK_WORKSHOPS)
}

export async function getProgress(): Promise<ProgressData> {
  return Promise.resolve(MOCK_PROGRESS)
}

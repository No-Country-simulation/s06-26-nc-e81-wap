export const EXPERIENCE_FILTERS = [
  "all",
  "liderazgo",
  "mujeres-en-tech",
  "cambio-de-carrera",
  "emprendimiento",
  "latam",
] as const

export type ExperienceFilter = (typeof EXPERIENCE_FILTERS)[number]

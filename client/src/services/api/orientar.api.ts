import { apiClient } from '@/services/http-client'

export interface OrientarRequest {
  usuario_id: string
  perfil: string
  nivel: string
  region: string
  idioma: string
  lat: number
  lng: number
}

export interface OrientarResponse {
  gap_porcentual: number
  gap_items: string[]
  trayectoria_sugerida: string
  vacantes_compatibles: string[]
  confianza: number
}

export async function orientar(payload: OrientarRequest) {
  const { data } = await apiClient.post<OrientarResponse>('/orientar', payload)
  return data
}

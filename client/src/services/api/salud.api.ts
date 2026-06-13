import { apiClient } from '@/services/http-client'

export interface SaludRequest {
  usuario_id: string
  humor: string
  nota_semanal: number
  contexto: string
}

export interface SaludResponse {
  mensaje: string
  accion_sugerida: string
  derivar_cvv: boolean
  nota_actual: number
  alerta: boolean
}

export async function checkSalud(payload: SaludRequest) {
  const { data } = await apiClient.post<SaludResponse>('/salud', payload)
  return data
}

export interface OrientarRequest {
  usuario_id: string;
  perfil: string;
  nivel: string;
  region: string;
  idioma: string;
  lat: number;
  lng: number;
}

export interface OrientarResponse {
  gap_porcentual: number;
  gap_items: string[];
  trayectoria_sugerida: string;
  vacantes_compatibles: string[];
  confianza: number;
}

export async function orientar(
  _payload: OrientarRequest,
): Promise<OrientarResponse> {
  // TODO: reemplazar por la llamada real cuando exista el back
  // import { apiClient } from "@/services/http-client";
  // const { data } = await apiClient.post<OrientarResponse>('/orientar', _payload)
  // return data

  return {
    gap_porcentual: 30,
    gap_items: [
      "Cloud Computing básico (AWS/GCP)",
      "Python intermedio — estructuras de datos",
      "Inglés técnico nivel B1",
    ],
    trayectoria_sugerida:
      "Cloud Practitioner (AWS) → Python Developer → Junior Cloud Engineer",
    vacantes_compatibles: [
      "Junior Cloud Engineer — Mercado Libre",
      "Python Trainee — IBM",
      "Soporte Técnico Cloud — AWS",
    ],
    confianza: 0.85,
  };
}

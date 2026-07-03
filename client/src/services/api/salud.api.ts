export interface SaludRequest {
  usuario_id: string
  humor: number
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

const MOCK_RESPONSES: Record<number, SaludResponse> = {
  1: {
    mensaje: "Entiendo que estés pasando por un momento difícil. No estás solo en esto.",
    accion_sugerida: "Te recomiendo dar un paseo corto al aire libre y hablar con alguien de confianza. Si la sensación persiste, busca apoyo profesional.",
    derivar_cvv: true,
    nota_actual: 1,
    alerta: true,
  },
  2: {
    mensaje: "Parece que hoy no ha sido un buen día. Está bien sentirse así a veces.",
    accion_sugerida: "Prueba escuchar tu música favorita o ver un episodio de una serie que te haga reír. A veces pequeñas pausas ayudan.",
    derivar_cvv: false,
    nota_actual: 2,
    alerta: true,
  },
  3: {
    mensaje: "Un día neutral también es válido. No todo tiene que ser extraordinario.",
    accion_sugerida: "¿Qué tal dedicar 15 minutos a una actividad que disfrutes? Leer, dibujar o simplemente descansar.",
    derivar_cvv: false,
    nota_actual: 3,
    alerta: false,
  },
  4: {
    mensaje: "Qué bueno que estás teniendo un buen día. Eso merece celebrarse.",
    accion_sugerida: "Aprovecha esta energía para conectar con alguien o avanzar en un proyecto personal. El buen ánimo es contagioso.",
    derivar_cvv: false,
    nota_actual: 4,
    alerta: false,
  },
  5: {
    mensaje: "¡Excelente! Tu energía está al máximo. Hoy es un gran día.",
    accion_sugerida: "Comparte esa positividad con alguien más. Un mensaje de ánimo a un amigo puede marcar la diferencia.",
    derivar_cvv: false,
    nota_actual: 5,
    alerta: false,
  },
}

export async function checkSalud(payload: SaludRequest): Promise<SaludResponse> {
  const response = MOCK_RESPONSES[payload.humor] ?? MOCK_RESPONSES[3]
  return response
}

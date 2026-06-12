# Módulo 03 — Orientar (Endpoint principal del agente)

> **Rama módulo**: `feat/appbit/orientar`
> **Endpoint principal**: `POST /orientar`
> **Entidades DB**: `usuario`, `vacante`, `curso`, `trayectoria`

---

## US-03-OR-01 — Recibir orientación personalizada

**Como** usuario con perfil completo  
**quiero** que el agente analice mi perfil y me muestre:  
**para** entender mi gap con el mercado y qué hacer a continuación.

### Request

```json
{
  "usuario_id": "uuid",
  "perfil": "estudiante",
  "nivel": "junior",
  "region": "BR-SP-SaoPaulo",
  "idioma": "pt",
  "lat": -23.55,
  "lng": -46.63
}
```

### Response esperado

```json
{
  "gap_porcentual": 70,
  "gap_items": ["kubernetes", "terraform", "aws-cert"],
  "trayectoria_sugerida": {
    "id": "uuid",
    "cursos": ["curso-uuid-1", "curso-uuid-2"],
    "duracion_total_horas": 120
  },
  "vacantes_compatibles": [
    { "id": "vacante-uuid", "titulo": "...", "gap_porcentual": 70 }
  ],
  "confianza": 0.85
}
```

### Criterios de aceptación

- [ ] Cruza `usuario.area_tecnologia` + `nivel_profesional` + `objetivo` con `vacante.requisitos`.
- [ ] Devuelve al menos 1 vacante si existen compatibles; si no, lista vacantes del área con gap mayor y mensaje "amplía tu búsqueda".
- [ ] Calcula `gap_porcentual` como: `(skills_cumplidos / skills_requeridos) * 100`, redondeado.
- [ ] Genera o reutiliza `trayectoria` activa para el usuario.
- [ ] `confianza` ∈ [0, 1] — placeholder en MVP mockeado; producción con modelo.
- [ ] **Latencia del endpoint p95 < 5s en MVP** (con datos mockeados) — más realista para stack dockerizado en Railway free tier. En producción con datos reales, objetivo p95 < 3s. (Ver `despliegue.md` §10.4 — SLO 99% para `/orientar`).
- [ ] Latencia de generación inicial (cold start) < 8s p95.
- [ ] Logs estructurados con `usuario_id`, `gap_porcentual`, `timestamp`.
- [ ] GlitchTip captura errores.
- [ ] **k6 shallow en CI** valida que el endpoint mantiene p95 < 5s con 10 VUs.

### Tareas técnicas derivadas

- `task/appbit/orientar/endpoint` — `POST /orientar`
- `task/appbit/orientar/gap-calculator` — lógica de matching perfil↔vacante
- `task/appbit/orientar/trayectoria-generator` — selección de cursos para cerrar gap
- `task/appbit/orientar/agent-prompt` — prompt base del agente IA
- `task/appbit/orientar/mocks` — fixtures de vacantes y cursos

---

## US-03-OR-02 — Visualizar la pantalla "Mi orientación"

**Como** usuario  
**quiero** ver en una sola pantalla mi gap, mis vacantes y mi trayectoria sugerida  
**para** tomar una decisión informada sin saltar entre vistas.

### Criterios de aceptación

- [ ] Ruta `/orientar` accesible desde el home.
- [ ] Sección 1: "Tu gap hoy" — porcentaje grande + lista de skills faltantes con íconos.
- [ ] Sección 2: "Vacantes compatibles" — cards ordenadas por menor gap (más cercanas al perfil).
- [ ] Sección 3: "Tu próximo paso" — primer curso de la trayectoria, con CTA "Empezar".
- [ ] Botón "Actualizar" re-ejecuta `/orientar` con datos frescos.
- [ ] Estado de carga con skeleton; estado vacío con mensaje explicativo.

### Tareas técnicas derivadas

- `task/appbit/orientar/orientar-screen`
- `task/appbit/orientar/vacante-card`
- `task/appbit/orientar/curso-card`

---

## US-03-OR-03 — Recalcular orientación al cambiar objetivo

**Como** usuario  
**quiero** que al cambiar mi objetivo profesional (`objetivo`) la orientación se recalcule  
**para** que refleje mi nueva intención.

### Criterios de aceptación

- [ ] Trigger automático al guardar cambio de `objetivo` en perfil.
- [ ] Trayectoria previa se marca `activa=false`.
- [ ] Nueva trayectoria se genera.
- [ ] Usuario ve toast "Tu orientación se actualizó".

### Tareas técnicas derivadas

- `task/appbit/orientar/recalculate-on-objetivo-change`

---

## Responsables sugeridos

- **Backend/API**: endpoint + cálculo de gap + agente
- **Frontend**: pantalla y cards
- **Data**: sembrar catálogo de cursos y vacantes
- **Agente IA**: diseño de prompt y prompt-engineering

# App de Orientación Personal — App BiT (B2C)

## Sobre tu participación

- Trabajás para un proyecto de una empresa real. Esto no implica relación laboral. 
- El equipo decide qué funcionalidades construir, cómo construirlas, y en caso de escasez de detalles tiene la libertad de generar ideas y soluciones con creatividad.

## Problema

Personas de grupos sub-representados enfrentan barreras simultáneas de empleo, formación y salud mental sin un soporte integrado, humanizado y culturalmente relevante.

## Descripción

### App de Orientación Personal — App BiT (B2C)

El desafío B2C propone el desarrollo de una web app responsiva con agente de IA, creada para apoyar a personas de grupos sub-representados de forma amplia, integrada y verdaderamente humana.

La propuesta es actuar, al mismo tiempo, en cinco dimensiones esenciales del camino de estas personas: formación, empleabilidad, experiencias, mentorías y salud mental.

No se trata solo de una app de empleos.
No es solo una plataforma de cursos.
Tampoco es solo una solución de bienestar.

Es un ecosistema pensado para mirar a cada participante de forma 360°, con empatía, acompañamiento y relevancia cultural — reuniendo, en un solo lugar, el soporte necesario para que cada persona pueda desarrollarse, pertenecer y avanzar con más oportunidad, confianza y perspectiva de futuro.

---

### PERFIL DEL USUARIO

Estudiante en formación, universitario, graduado sin empleo en el área o profesional buscando cambio. 

Al crear la cuenta completa:

**Datos personales:** nombre, e-mail, fecha de nacimiento, género, escolaridad, continente, país, estado (BR), ciudad, WhatsApp

**Datos profesionales:** nivel, área de tecnología, qué busca — estudiar / definir camino / buscar empleo / cambiar de empleo

### Dolores reales que la solución debe abordar:

- Baja autoestima y complejo de inferioridad.
- Ciclo de exclusión — una barrera lleva a otra.
- Desventajas socioeconómicas acumuladas.
- Falta de sentido de pertenencia en el mercado tecnológico.
- Networking restringido — no conocen a las personas correctas.
- Sensación de que siempre falta algo para ser elegible.

---

## LOS 5 SERVICIOS — MVP

### 1. FORMACIONES

1. Cursos gratuitos (Programa GEAR de Google Cloud, Programa ONE de Oracle & Alura) y otros pagos. 
2. Trayectorias personalizadas basadas en el gap identificado en el perfil del usuario. 
3. El agente cruza el perfil con las trayectorias disponibles y recomienda el próximo paso concreto.

### 2. EMPLEABILIDAD

1. Match automático e##ntre perfil y vacantes disponibles. 
2. **La app muestra el gap de forma clara**: "Cumples el 70% de los requisitos de esta vacante — ve qué falta y cómo resolverlo".\
3. **La lógica es simple**: el mercado ya cubre el 70% de las necesidades del usuario — la plataforma muestra el 30% que falta y ofrece una solución concreta. 
4. Si el usuario es contratado vía plataforma, la app recibe un porcentaje de la empresa. 
5. El usuario no paga nada.

### 3. EXPERIENCIAS ESTRUCTURANTES

Eventos en vivo y grabados con testimonios de personas que vivieron trayectorias similares: CEOs, líderes y profesionales que superaron las mismas barreras. 

El usuario se identifica con las historias y encuentra referencias reales de que es posible. 

El engagement ocurre cuando las personas reconocen su propio dolor en la trayectoria de otra persona y encuentran allí una salida.

### 4. MENTORÍAS

#### 1. **Networking humanizado** 
 
 - mentores que invitan al usuario a una práctica, no solo a una entrevista formal. 
 - Otras formas de entrar al mercado más allá de la puerta convencional. 
 - "¿Quieres venir a una práctica conmigo?" es el espíritu de este servicio: una conexión real, basada en confianza, no en currículum.

#### 5. SALUD MENTAL

- Check-in diario vía emojis (feliz, cansado, triste, ansioso, sobrecargado...) al entrar a la app. 
- El agente de IA detecta el estado emocional del usuario y sugiere acciones concretas y humanas: un capítulo de libro, un episodio de podcast, caminar descalzo en el pasto, una serie, una caminata bajo la lluvia. 
- La referencia inspiradora es el modelo de Alcohólicos Anónimos — escuchar sin juzgar ya es el inicio de la cura. 
- En situaciones de crisis (nota por debajo de 4), el agente deriva automáticamente al CVV (Centro de Valorización de la Vida).

---

## FLUJO DEL USUARIO

1. Crea cuenta y completa perfil personal y profesional completo
2. La app analiza el perfil y muestra vacantes compatibles + gap porcentual ("cumples el 70%")
3. Recibe trayectoria de formación concreta para cerrar el gap identificado
4. Accede a mentores disponibles y agenda conversación o práctica
5. El agente de salud mental hace el primer check-in: "¿Cómo estás hoy?"
6. Recibe sugerencias de acciones concretas de bienestar basadas en su estado y contexto regional
7. Visualiza eventos y recursos cercanos por geolocalización (dataset Vísent CDRView)

---

## DATASET VÍSENT CDRVIEW

- Datos de concentración de personas por zona + cobertura de red ERB (5G/4G/3G) con coordenadas reales de antenas Anatel. 
- Datos emulados con coordenadas reales. 
- Disponible en: github.com/wongola-bit/appbit-hackathon (incluye README y diccionario de columnas).

**Uso en este desafío**: 

 - mostrar eventos y recursos cercanos según zona y conectividad del usuario. 
 - Si la cobertura de red es baja en la región, el agente puede sugerir contenido offline para garantizar acceso incluso sin internet estable.

---

## ENDPOINTS PRINCIPALES

### POST /orientar

- **Request**: { usuario_id, perfil, nivel, region, idioma, lat, lng }
- **Response**: { gap_porcentual, gap_items, trayectoria_sugerida, vacantes_compatibles, confianza }

### POST /salud

- **Request**: { usuario_id, humor, nota_semanal, contexto }
- **Response**: { mensaje, accion_sugerida, derivar_cvv, nota_actual, alerta }
- **Nota**: nota_semanal < 4 activa derivar_cvv: true (situación de crisis)

---

## FUNCIONALIDADES EXIGIDAS — MVP

1. Onboarding completo: datos personales y profesionales.
2. Endpoint /orientar con gap porcentual + trayectoria sugerida.
3. O endpoint /salud con check-in vía emojis + acción sugerida.
4. Interfaz responsiva con al menos home + una pantalla funcional.
5. README con instrucciones de ejecución local y ejemplos de request/response.

---

## FUNCIONALIDADES OPCIONALES

1. Ambos endpoints en producción e integrados
2. Integración con dataset Vísent CDRView para eventos por geolocalización
3. Sección Experiencias Estructurantes con videos y testimonios reales
4. Módulo de mentorías con agenda e invitación a práctica
5. Descarga offline de recursos para regiones con baja conectividad
6. Notificaciones push diarias de bienestar
7. Soporte multilingüe PT + ES
8. Derivación automática al CVV en situaciones de crisis (nota < 4)

---

## ORIENTACIONES TÉCNICAS

1. **Plataforma**: 
    * Web App Responsiva (PWA) — funciona en el celular y en el escritorio. 
    * Usa la tecnología que tu equipo ya domina: React, Vue, Node.js, Spring Boot, Python, Java o cualquier otra.
2. **El stack no es obligatorio** — cada equipo elige lo que mejor conoce.
3. Comienza por el contrato de integración entre los miembros del equipo el Día 1.
4. **El agente de salud mental es sensible** — testéalo exhaustivamente antes de poner en producción.
5. Nunca subas credenciales o claves de API al repositorio.
6. **Deploy**: Railway o Render para el MVP. 

---

## POR DÓNDE EMPEZAR — DÍA 1

1. Reunión de equipo: presentación, división de responsabilidades y alineación del contrato de integración
2. **Configurar ambiente local**: repositorio GitHub, archivo .env, base de datos
3. **Dividir los frentes**: interfaz con pantalla de onboarding / API con /orientar retornando datos mockeados / agente con primer prompt aislado

---

## NOTA DE OPORTUNIDAD

- Este
 desafío es parte de un producto mayor con alcance en Brasil, Angola y LATAM. 
- Los mejores proyectos podrán ser presentados a inversores reales en el Shark Tank BiT para seed funding y contratos piloto.

---

## REFERENCIAS CULTURALES

Las películas a continuación fueron seleccionadas para ampliar la comprensión sobre la dimensión de impacto que buscamos alcanzar — un enfoque que vaya más allá del asistencialismo y promueva autonomía, pertenencia, protagonismo y transformación real.

### Películas:

1. The Boy Who Harnessed the Wind — joven africano que resuelve la sequía con ingeniería y determinación.
2. El Indomable Will Hunting (Good Will Hunting) — potencial reprimido por falta de oportunidad.
3. Infinito — superación personal y propósito.
4. En Busca de la Felicidad (The Pursuit of Happyness) — resiliencia y emprendimiento desde la adversidad.
5. Manos Talentosas (Gifted Hands) — talento que supera barreras socioeconómicas.
6. Reina de Katwe — protagonismo femenino negro en tecnología.

### Libros:

1. Enamórate del Problema, No de la Solución — Uri Levine (cofundador de Waze).
2. De Dónde Vienen las Buenas Ideas — Steven Johnson.

## Impacto:

- Experiencia de usuario.

## Entrega Esperada:

- Demo.
- Documentación.
- Mvp.
- prototipo.

## Herramientas Esperadas:
- TypeScript.
- Python.
# Requisitos y objetivos del desafío B2C

El reto B2C exige crear un ecosistema digital 360° que apoye integralmente a personas subrepresentadas en formación, empleo, mentoría, experiencias y salud mental. 

No basta con un portal de cursos o de empleo aislado; debe verse a cada usuario con empatía y relevancia cultural, eliminando barreras técnicas y cognitivas. 

En la UE, 1 de cada 4 adultos tiene alguna discapacidad, de modo que la plataforma debe diseñarse con accesibilidad (contrastes adecuados, navegación por teclado/voz, subtítulos, etc.) e inclusión desde el inicio. 

Esto implica adaptar contenidos y lenguaje según cultura, género y edad, garantizando que interfaces claras y consistentes reduzcan la ansiedad del usuario – por ejemplo, se ha comprobado que interfaces limpias y intuitivas disminuyen el estrés, mientras que las confusas lo aumentan.   

El objetivo es brindar acompañamiento humano-virtual real: un agente de IA conversacional integrado que oriente al usuario en cada dimensión, generando confianza y sentido de pertenencia.

## Soluciones existentes y buenas prácticas

### Formación (EdTech): 

Plataformas adaptativas que usan IA para personalizar el aprendizaje. 

Por ejemplo, tutores virtuales y bibliotecas de contenido que se ajustan al ritmo y estilo de cada usuario. Estos sistemas acercan la educación a mujeres y minorías al hacerla más accesible y asequible, superando barreras culturales y de género.

### Empleabilidad: 

Portales de empleo inteligentes con buscadores y matching de habilidades. Herramientas de IA pueden filtrar candidatos objetivamente, enfocándose en competencias en lugar de prejuicios.

Incluso pueden analizar el entorno laboral y sugerir adaptaciones (rampas, lectores de pantalla, asistentes de voz) que faciliten el trabajo a personas
con discapacidad. 

Incluya creación de CV guiada por IA, simuladores de entrevistas y retroalimentación personalizada.

### Mentorías y networking: 

Programas de mentoría digital que superan la limitación geográfica. 

Se emplean diversos formatos: mentoría uno-a-uno tradicional, mentoría grupal, peer mentoring o mentoría inversa (mentores juniors a seniors) según necesidades. 

El emparejamiento cuidadoso de mentor/mentee debe basarse en objetivos de carrera y habilidades, no solo en datos demográficos. 

Las buenas plataformas sugieren temas de conversación, frecuencia de reuniones y recursos para guiar el proceso, y hacen seguimiento de avances. 

Según la experiencia, la mentoría fortalece la confianza y abre oportunidades profesionales para grupos subrepresentados.

### Experiencias y comunidad: 

Incorporar foros y grupos temáticos para compartir historias y recursos culturales relevantes, construir comunidad y organizar actividades virtuales (talleres, webinars, ferias de empleo) que enriquezcan la vivencia. 

La gamificación y retos colaborativos (badges, puntos por logros) también pueden aumentar la motivación y el sentido de pertenencia.

### Salud mental: 

Integrar funcionalidades de bienestar. Las apps exitosas incluyen diarios de estado de ánimo, herramientas de mindfulness o meditación, recordatorios de hábitos saludables y chatbots de apoyo emocional. 

En momentos de angustia, actividades guiadas por IA (ejercicios de respiración, mensajes alentadores) pueden aliviar hasta que llegue ayuda profesional. 

Adicionalmente, debe haber rutas claras de escalada: botones de crisis o líneas directas con expertos, de modo que ante señales de riesgo (p. ej. ideación suicida) se deriven usuarios a atención humana inmediatamente. 

### Todo el diseño debe ser sensible:

Interfaces amigables que reducen carga cognitiva y promueven retroalimentación positiva mejoran el bienestar general.

## Arquitectura técnica y componentes de IA propuestos

La solución se basaría en microservicios independientes, implementados
con Java Spring Boot. 

Por ejemplo, microservicios separados para gestión de usuarios, administración de cursos, motor de matching laboral, sistema de mentoría y módulo de salud mental. 

Esto permite escalar cada parte según demanda y aislar fallos (cada microservicio con su propia base de datos). 

Para integrar IA se usaría Spring AI (Spring Boot 3+), que facilita conexiones con modelos de lenguaje grandes (OpenAI GPT, Google PaLM, etc.).

Spring AI proporciona un API de chat con memoria conversacional y RAG (generación aumentada por recuperación) para consultar conocimiento específico (por ejemplo, cursos o guías formativas indexadas en una base vectorial). 

Así, el agente IA conversacional puede responder preguntas del usuario
contextualizadas con sus datos: recomendar un curso basado en intereses
previos, orientar en trámites de empleo o sugerir ejercicios de relajación según el estado de ánimo.

El frontend debe ser web responsiva (React, Next, o un framework Java como
Vaadin) con diseño accesible (contrast ratio WCAG, textos escalables, navegación por teclado/vía voz). 

La base de datos relacional (MySQL/PostgreSQL) almacenaría perfiles, progreso y contenido estructurado. 

Una base de datos vectorial (Milvus, Pinecone, Elasticsearch con vectores) indexaría las representaciones embebidas de documentos de capacitación, ofertas de empleo y FAQs, permitiendo búsquedas semánticas y recomendaciones de IA. 

El despliegue se haría en contenedores Docker orquestados con Kubernetes (o en servicios cloud serverless) para lograr alta disponibilidad. 

Se implementaría monitoreo y logs centralizados, aprovechando incluso IA en observabilidad (detección automática de anomalías). 

###  En resumen: 

Una arquitectura distribuida y modular, con capas claras Front–API–IA–Datos, que garantice escalabilidad, seguridad y cumplimiento de normativas (GDPR) desde el inicio.

## Diseño de experiencia de usuario y flujos 

La UX debe guiar al usuario de forma intuitiva en cada dimensión:

### Onboarding: 

- Cuestionario inicial que identifica perfil y necesidades
específicas (por ejemplo, nivel educativo, sector de empleo, signos de
estrés). 
- Con esto se personaliza la vista principal.

### Dashboard 360°: 

- Pantalla principal única donde el usuario ve su progreso
formativo (cursos completados, próximos módulos), alertas de
oportunidades laborales cercanas a su perfil, recomendaciones de
actividades y recordatorios de bienestar. 
- Gráficos simples (progreso de aprendizaje, mood trackers) y notificaciones claras.

### Mentoría: 

- Flujo de emparejamiento: tras indicar objetivos (e.g., “avanzar en
ingeniería”), el sistema propone mentores adecuados. 
- Se puede elegir modalidad 1:1, grupal o mentoría inversa según preferencia. Luego se programa sesiones por videollamada y la plataforma envía recordatorios y materiales de apoyo. Se registra el feedback posterior.

### Agente IA Conversacional: 

- Chat integrado (estilo chatbot) que el usuario puede consultar en cualquier momento. 
- Por ejemplo, preguntando “¿qué curso me recomiendas para datos?”, o “¿cómo mejorar mi CV?”. 
- El agente usa lenguaje natural y responde culturalmente relevante. Además, puede iniciar charlas proactivas (“¿Cómo te fue esta semana?”) para promover
uso continuo.

### Salud mental: 
- Flujos especiales de bienestar. Cada día el usuario puede registrar brevemente su estado de ánimo. 
- Si el sistema detecta indicadores de angustia (por ejemplo, varias entradas negativas), sugiere ejercicios de relajación o conecta con un consejero virtual. 
- En situaciones de crisis, se activa un workflow de emergencia: muestra un botón destacado que conecta por chat o llamada con profesionales capacitados.

### Diseño inclusivo y empatía: 

- Se usan colores neutros y fuentes legibles para minimizar fatiga. La navegación es coherente en toda la app. 
- Se ofrecen alternativas de interacción (texto-voz, tamaño ajustable, ayuda
contextual) para distintos públicos. 
- Como destaca Don Norman, interfaces fáciles de usar reducen la carga cognitiva y mejoran la adherencia a largo plazo.

## Plan de implementación, métricas y roadmap

El proyecto se desarrollaría en fases ágiles. 

Primero, se validan requerimientos con prototipos de baja fidelidad y pruebas de usuario (especialmente con representantes de los grupos objetivo). 

Luego se construye un MVP centrado en dos dimensiones clave (por ejemplo, cursos+chatbot IA), asegurando el esquema de diseño y bases de datos. 

Iterativamente se añaden funciones de empleo, mentoría y finalmente salud mental, ajustando según feedback.

Se definen métricas de éxito para cada dimensión: tasa de registro y retención, número de cursos completados, empleos gestionados, sesiones de mentoría agendadas y (en salud mental) indicadores de uso del chatbot y satisfacción percibida. 

También se monitorea la calidad de la interacción IA (precisión de respuestas, tasa de resolución de dudas) y se aplican encuestas NPS o de
bienestar antes/después de usar la app. 

El roadmap incluye integraciones posteriores con APIs de terceros (plataformas de empleos, alianzas con universidades o ONGs) y expansión geográfica. 

Un lanzamiento escalonado podría comenzar en una región piloto, con recopilación de datos reales para afinar los algoritmos de IA y la experiencia cultural, antes de un despliegue más amplio.

## Fuentes: 

Se han considerado estudios y referencias sobre diseño inclusivo y UX,
arquitectura de microservicios y Spring Boot, capacidad de Spring AI para
chatbots, efectos de la IA en educación y empleo, mejores prácticas de mentoría digital y desarrollo de apps de salud mental con IA. Estos guían las decisiones técnicas y de diseño propuestas.
# Historias de Usuario – KernelCrew

## Epic 1: Módulo de Usuarios y Autenticación

### US-01 – Registro de usuario
**Como** visitante,  
**Quiero** registrarme con email y contraseña,  
**Para** poder acceder a la plataforma.

**Criterios de aceptación:**
- [ ] El formulario solicita: nombre, email, contraseña (mín. 8 caracteres), confirmación.
- [ ] El email debe ser único.
- [ ] Se valida el formato de email (regex).
- [ ] La contraseña se almacena hasheada mediante **bcrypt**.
- [ ] El usuario nuevo recibe rol `student` por defecto vía Spite.
- [ ] Se utiliza **FormRequests** en Laravel para sanitizar la entrada de datos.
- [ ] Redirección al dashboard tras registro exitoso.

**Prioridad:** Alta | **Sprint:** 1

---

### US-02 – Inicio de sesión
**Como** usuario registrado,  
**Quiero** iniciar sesión con email y contraseña,  
**Para** acceder a mi panel personal.

**Criterios de aceptación:**
- [ ] El formulario solicita email y contraseña.
- [ ] Implementación de **Rate Limiting** para prevenir ataques de fuerza bruta.
- [ ] Tras login exitoso, se recibe un token de autenticación **Sanctum**.
- [ ] El token debe ser revocado y regenerado en cada sesión para mitigar el **Session Hijacking**.
- [ ] Redirección según rol: `admin` → dashboard, `instructor` → mis cursos, `student` → catálogo.

**Prioridad:** Alta | **Sprint:** 1

---

### US-03 – Gestión de usuarios (Admin)
**Como** administrador,  
**Quiero** crear, ver, editar y eliminar usuarios,  
**Para** mantener la plataforma actualizada.

**Criterios de aceptación:**
- [ ] Listado de usuarios con paginación y búsqueda por nombre/email.
- [ ] **Protección de Datos (Soft Delete):** Implementación obligatoria de `SoftDeletes` en el modelo `User`. Queda prohibida la eliminación física (`forceDelete`) para preservar la integridad de la Epic de Pagos.
- [ ] Edición: permite cambiar nombre, email, rol, estado (activo/inactivo).
- [ ] **Blindaje SQL:** El motor de búsqueda debe usar **Scope Query** de Eloquent para asegurar parámetros sanitizados.
- [ ] Solo usuarios con rol `admin` pueden acceder a esta funcionalidad.

**Prioridad:** Alta | **Sprint:** 1

---

### US-04 – Recuperación de contraseña
**Como** usuario,  
**Quiero** recuperar mi contraseña si la olvido,  
**Para** poder volver a acceder a mi cuenta.

**Criterios de aceptación:**
- [ ] Formulario de recuperación solicita email.
- [ ] Se envía un email con enlace/token de recuperación (simulado).
- [ ] El token expira en 1 hora.
- [ ] Formulario para establecer nueva contraseña con validación de confirmación.

**Prioridad:** Media | **Sprint:** 1

---

## Epic 2: Módulo de Cursos

### US-05 – Catálogo público de cursos (Búsqueda Blindada)
**Como** visitante,  
**Quiero** ver el catálogo de cursos con filtros,  
**Para** encontrar cursos que me interesen.

**Criterios de aceptación:**
- [ ] Listado de cursos publicados con: título, descripción corta, nivel, categoría, duración.
- [ ] Filtros por: nivel (beginner, intermediate, advanced), categoría y precio.
- [ ] Paginación (10 cursos por página).
- [ ] **Blindaje contra Inyecciones SQL:** Todas las consultas de filtrado se realizan mediante **Eloquent ORM** o **Query Builder** con *parameterized bindings*. Prohibido el uso de variables concatenadas en `DB::raw()`.
**Prioridad:** Alta | **Sprint:** 1

---

### US-06 – Detalle de curso
**Como** estudiante,  
**Quiero** ver el detalle de un curso,  
**Para** conocer su contenido antes de inscribirme.

**Criterios de aceptación:**
- [ ] Muestra: título, descripción completa, temario, requisitos, nivel, duración, instructor.
- [ ] Indica si el curso requiere un plan de suscripción específico (Pro o Premium).
- [ ] Muestra botón de inscripción si el usuario cumple con los requisitos del plan.

**Prioridad:** Alta | **Sprint:** 1

---

### US-07 – Crear/editar cursos (Instructor)
**Como** instructor,  
**Quiero** crear y editar mis propios cursos,  
**Para** gestionar mi contenido de enseñanza.

**Criterios de aceptación:**
- [ ] Formulario con validación de campos obligatorios.
- [ ] Un instructor solo puede editar los cursos donde figura como autor.
- [ ] Los cursos nuevos quedan en estado "Borrador" (no visible al público) hasta su publicación manual.

**Prioridad:** Alta | **Sprint:** 1

---

### US-08 – Gestión de cursos (Admin)
**Como** administrador,  
**Quiero** gestionar todos los cursos (CRUD completo),  
**Para** mantener el catálogo actualizado.

**Criterios de aceptación:**
- [ ] Listado de todos los cursos (publicados y no publicados).
- [ ] Crear, editar, publicar/despublicar, eliminar cursos.
- [ ] Asignar instructor a un curso.

**Prioridad:** Alta | **Sprint:** 1

---

## Epic 3: Módulo de Suscripciones

### US-09 – Ver planes de suscripción
**Como** estudiante,  
**Quiero** ver los planes de suscripción disponibles,  
**Para** elegir el que mejor se adapta a mis necesidades.

**Criterios de aceptación:**
- [ ] Cada plan muestra: nombre, precio, duración, límite de cursos y descripción.
- [ ] Diferenciación visual clara del plan ilimitado (Premium).

**Prioridad:** Alta | **Sprint:** 2

---

### US-10 – Contratar suscripción
**Como** estudiante,  
**Quiero** suscribirme a un plan,  
**Para** acceder a los cursos según mi nivel de suscripción.

**Criterios de aceptación:**
- [ ] El registro del pago se ejecuta dentro de una **Transacción de Base de Datos** para asegurar consistencia atómica.
- [ ] Tras el pago, la suscripción pasa a estado `active`.
- [ ] El campo `end_date` se calcula automáticamente según los días del plan contratado.

**Prioridad:** Alta | **Sprint:** 2

---

### US-11 – Renovación automática
**Como** estudiante,  
**Quiero** que mi suscripción se renueve automáticamente,  
**Para** no perder acceso a los cursos.

**Criterios de aceptación:**
- [ ] El usuario puede activar/desactivar `auto_renew`.
- [ ] Al activarse, se simula un cobro al vencimiento.
- [ ] Se extiende `end_date` según `duration_days` del plan.
- [ ] Se registra un nuevo pago.

**Prioridad:** Media | **Sprint:** 2

---

### US-12 – Historial de suscripciones
**Como** estudiante,  
**Quiero** ver mi historial de suscripciones,  
**Para** conocer mis planes anteriores y actuales.

**Criterios de aceptación:**
- [ ] Listado cronológico con: plan, fechas, estado, monto pagado.
- [ ] Indicador visual de suscripción activa.

**Prioridad:** Media | **Sprint:** 2

---

## Epic 4: Módulo de Pagos

### US-13 – Pago con pasarela de prueba
**Como** estudiante,  
**Quiero** pagar mi suscripción mediante una pasarela de prueba (Stripe/PayPal sandbox),  
**Para** simular el proceso de pago real.

**Criterios de aceptación:**
- [ ] Integración con Stripe Checkout (modo test) o PayPal Sandbox.
- [ ] Muestra resumen de pago: plan, monto, impuestos (si aplica).
- [ ] Tras pago exitoso, se genera registro en `payments`.
- [ ] Manejo de errores de pago (tarjeta declinada, etc.).

**Prioridad:** Alta | **Sprint:** 2

---

### US-14 – Confirmación de pago
**Como** estudiante,  
**Quiero** recibir confirmación de pago antes de activar mi suscripción,  
**Para** tener constancia de mi transacción.

**Criterios de aceptación:**
- [ ] Se muestra pantalla de confirmación con: transaction_id, monto, fecha, plan.
- [ ] Se envía email de confirmación (simulado).
- [ ] La suscripción se activa solo tras `status = completed`.

**Prioridad:** Alta | **Sprint:** 2

---

### US-15 – Registro de transacciones (Admin)
**Como** administrador,  
**Quiero** ver todas las transacciones de pago,  
**Para** tener control de los ingresos.

**Criterios de aceptación:**
- [ ] Listado con: usuario, plan, monto, fecha, método, estado.
- [ ] Filtros por estado, fecha, método de pago.
- [ ] Exportable a CSV/PDF.

**Prioridad:** Media | **Sprint:** 2

---

## Epic 5: Restricción de Acceso a Cursos

### US-16 – Acceso según suscripción
**Como** estudiante,  
**Quiero** ver solo los cursos permitidos por mi plan de suscripción,  
**Para** saber a cuáles tengo acceso.

**Criterios de aceptación:**
- [ ] Los cursos muestran un indicador si el plan del usuario permite acceso.
- [ ] Si el usuario no tiene suscripción activa, muestra mensaje de invitación a suscribirse.
- [ ] Basic: acceso a cursos de nivel beginner.
- [ ] Pro: acceso a cursos beginner + intermediate.
- [ ] Premium: acceso a todos los cursos.

**Prioridad:** Alta | **Sprint:** 3

---

### US-17 – Inscripción a curso
**Como** estudiante con suscripción activa,  
**Quiero** inscribirme en un curso,  
**Para** comenzar a aprender.

**Criterios de aceptación:**
- [ ] Botón de inscripción visible si el usuario tiene acceso.
- [ ] Se valida que la suscripción esté activa.
- [ ] Se registra en `course_enrollments` con `progress = 0`.
- [ ] No se permite doble inscripción al mismo curso.

**Prioridad:** Alta | **Sprint:** 3

---

### US-18 – Seguimiento de progreso
**Como** estudiante,  
**Quiero** ver mi progreso en los cursos inscritos,  
**Para** saber cuánto me falta para completarlos.

**Criterios de aceptación:**
- [ ] Dashboard muestra cursos inscritos con barra de progreso.
- [ ] Porcentaje de avance (0-100%).
- [ ] Marcado de curso completado cuando progress = 100%.
- [ ] Fecha de completado registrada.

**Prioridad:** Media | **Sprint:** 3

---

## Epic 6: Reportes

### US-19 – Ingresos mensuales por tipo de suscripción
**Como** administrador,  
**Quiero** ver un reporte de ingresos mensuales desglosado por tipo de suscripción,  
**Para** analizar la rentabilidad de cada plan.

**Criterios de aceptación:**
- [ ] Gráfico de barras o tabla con: mes, plan, cantidad de suscripciones, total ingresos.
- [ ] Filtro por rango de fechas.
- [ ] Exportable a PDF/CSV.

**Prioridad:** Alta | **Sprint:** 3

---

### US-20 – Top 5 cursos más inscritos
**Como** administrador,  
**Quiero** ver los 5 cursos con más inscripciones,  
**Para** identificar los más populares.

**Criterios de aceptación:**
- [ ] Tabla/listado con: curso, instructor, cantidad de inscripciones, nivel.
- [ ] Orden descendente por inscripciones.
- [ ] Filtro por período.

**Prioridad:** Alta | **Sprint:** 3

---

### US-21 – Estudiantes activos vs inactivos
**Como** administrador,  
**Quiero** ver un reporte de estudiantes activos vs inactivos,  
**Para** conocer la retención de usuarios.

**Criterios de aceptación:**
- [ ] Gráfico circular con: activos (suscripción vigente), inactivos (sin suscripción).
- [ ] Cantidad numérica de cada grupo.
- [ ] Filtro por fecha de registro.

**Prioridad:** Alta | **Sprint:** 3

---

### US-22 – Generación de Certificados de Finalización
**Como** estudiante que ha completado un curso al 100%,  
**Quiero** generar y descargar un certificado de finalización en formato PDF,  
**Para** avalar los conocimientos adquiridos y compartirlo en mi perfil profesional.

**Criterios de aceptación:**
- [ ] El botón de "Descargar Certificado" solo se habilita en la interfaz cuando el progreso del estudiante alcanza exactamente el 100%.
- [ ] El documento PDF generado incluye diseño institucional: nombre completo del estudiante, título exacto del curso, fecha de emisión y nombre del instructor.
- [ ] El certificado incorpora un código único alfanumérico (UUID) y un código QR escaneable para validación futura.
- [ ] **Criterio Técnico:** Al emitirse por primera vez, el backend guarda el UUID en una tabla `certificates` para garantizar la autenticidad. La generación del archivo PDF se procesa optimizando el uso de memoria (streams) para no saturar el servidor.

**Prioridad:** Media | **Sprint:** 3

---

### US-23 – Sistema de Reseñas y Calificaciones (Gamificación)
**Como** estudiante,  
**Quiero** dejar una calificación y un comentario en los cursos que estoy consumiendo,  
**Para** orientar a futuros estudiantes y proporcionar retroalimentación al instructor.

**Criterios de aceptación:**
- [ ] El sistema de evaluación solo se desbloquea si el estudiante tiene una inscripción activa y ha superado al menos el 20% de progreso del curso.
- [ ] El formulario requiere una puntuación obligatoria de 1 a 5 estrellas y permite un comentario de texto opcional.
- [ ] **Restricción de integridad:** Un usuario solo puede dejar una (1) reseña por curso. Si envía otra, el sistema actualiza la reseña existente (Upsert).
- [ ] El promedio global de estrellas y el total de reseñas de cada curso se muestran públicamente en el catálogo principal (US-05).
- [ ] **Criterio Técnico:** El cálculo del promedio debe estar optimizado para evitar el problema N+1 de Eloquent y los resultados deben almacenarse en caché para garantizar cargas rápidas.

**Prioridad:** Media | **Sprint:** 3

---

## Epic 7: Asistencia con Inteligencia Artificial (Módulo IA)

### US-24 – Asistente de Aprendizaje en Menú (KernelAI)
**Como** estudiante,  
**Quiero** un asistente LLM integrado en la plataforma,  
**Para** resolver dudas técnicas sobre el contenido de los cursos de forma instantánea.

**Criterios de aceptación:**
- [ ] El menú principal (Sidebar) incluye un acceso directo al componente `KernelAI`.
- [ ] **Gobernanza y Costos:** El backend debe validar que el usuario tenga una **suscripción activa** antes de permitir el envío de prompts al LLM.
- [ ] **Proxy Seguro con OpenRouter:** El backend gestiona la comunicación con OpenRouter (usando modelos como Claude 3.5 o Llama 3); la API Key nunca se expone al frontend.
- [ ] **Contexto Dinámico:** La IA recibe automáticamente el contexto del curso que el alumno está visualizando para dar respuestas precisas y personalizadas.
- [ ] La interfaz debe mostrar la respuesta en tiempo real (streaming) mediante el efecto de máquina de escribir.

**Prioridad:** Alta | **Sprint:** 3

---

## Epic 8: Infraestructura y Despliegue (DevOps LAN)

### US-25 – Integración y Despliegue Continuo (CI/CD) vía Tailscale
**Como** equipo de desarrollo,  
**Queremos** que cada mejora aprobada en `develop` se despliegue automáticamente en nuestro servidor local,  
**Para** realizar pruebas de integración continuas sin exponer el servidor a internet.

**Criterios de aceptación:**
- [ ] **Integración Continua (CI):** Cada Pull Request hacia la rama `develop` dispara un pipeline de GitHub Actions que ejecuta tests unitarios, Laravel Pint (linting) y análisis estático.
- [ ] **Despliegue Continuo (CD) en LAN:** Tras un merge exitoso en `develop`, el pipeline se conecta a la red privada **Tailscale** del equipo mediante una *Ephemeral Auth Key*.
- [ ] El despliegue se ejecuta mediante **SSH sobre la IP privada (100.x.x.x)** del servidor, realizando `git pull`, `migrate --force` y limpieza de caché automáticamente.
- [ ] **Seguridad de Red:** El servidor local no requiere apertura de puertos en el router físico (Port Forwarding), limitando el acceso solo a miembros autorizados en la Tailnet.

**Prioridad:** Alta | **Sprint:** 1

---
## Criterios de Aceptación Transversales

| ID | Criterio |
|----|----------|
| CA-01 | Todas las respuestas de la API usan formato JSON estandarizado |
| CA-02 | Los endpoints protegidos requieren token Sanctum válido |
| CA-03 | Los roles se verifican mediante middleware/policies |
| CA-04 | Validación de datos en frontend y backend |
| CA-05 | Manejo de errores con mensajes amigables al usuario |
| CA-06 | La interfaz es responsive (mobile-first) |
| CA-07 | Las contraseñas nunca se muestran en logs ni respuestas |
| CA-08 | **Auditoría:** Uso obligatorio de **Soft Deletes** en modelos clave (Users, Courses, Subscriptions). |
| CA-09 | **Metodología Git:** Flujo de trabajo basado en ramas `feature/` integradas en `develop` mediante Pull Requests. |
| CA-10 | **Rendimiento:** Todos los listados de gran volumen devuelven datos paginados. |
| CA-11 | **Procesos Asíncronos:** El envío de correos y tareas pesadas se procesan mediante **Queues**. |
| CA-12 | **SQL Injection Zero:** Uso mandatorio de parámetros vinculados; prohibida la concatenación en `DB::raw`. |
| CA-13 | **GitFlow LAN:** Despliegue automático hacia el servidor local a través de la red privada de **Tailscale**. |
| CA-14 | **Gestión de Secretos:** Las llaves de APIs se gestionan como GitHub Secrets y variables de entorno `.env`. |
| CA-15 | **Integridad de IA:** Validación de suscripción previa al consumo de modelos de lenguaje (OpenRouter). |

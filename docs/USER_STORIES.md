# Historias de Usuario – KernelCrew

## Epic 1: Módulo de Usuarios y Autenticación

### US-01 – Registro de usuario
**Como** visitante,  
**Quiero** registrarme con email y contraseña,  
**Para** poder acceder a la plataforma.

**Criterios de aceptación:**
- [ ] El formulario solicita: nombre, email, contraseña (mín. 8 caracteres), confirmación.
- [ ] El email debe ser único.
- [ ] Se valida el formato de email.
- [ ] La contraseña se almacena hasheada (bcrypt).
- [ ] El usuario nuevo recibe rol `student` por defecto.
- [ ] Se muestra mensaje de éxito tras el registro.
- [ ] Redirección al dashboard tras registro exitoso.

**Prioridad:** Alta | **Sprint:** 1

---

### US-02 – Inicio de sesión
**Como** usuario registrado,  
**Quiero** iniciar sesión con email y contraseña,  
**Para** acceder a mi panel personal.

**Criterios de aceptación:**
- [ ] El formulario solicita email y contraseña.
- [ ] Muestra error si las credenciales son inválidas.
- [ ] Tras login exitoso, se recibe un token de autenticación (Sanctum).
- [ ] El token se almacena de forma segura (httpOnly cookie o localStorage con interceptor).
- [ ] Redirección según rol: admin → dashboard, instructor → mis cursos, student → catálogo.

**Prioridad:** Alta | **Sprint:** 1

---

### US-03 – Gestión de usuarios (Admin)
**Como** administrador,  
**Quiero** crear, ver, editar y eliminar usuarios,  
**Para** mantener la plataforma actualizada.

**Criterios de aceptación:**
- [ ] Listado de usuarios con paginación y búsqueda por nombre/email.
- [ ] Formulario de creación con: nombre, email, contraseña, rol.
- [ ] Edición: permite cambiar nombre, email, rol, estado (activo/inactivo).
- [ ] Eliminación lógica (soft delete o marcar como inactivo).
- [ ] Solo admins pueden acceder a esta funcionalidad.

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
- [ ] Formulario para nueva contraseña con confirmación.

**Prioridad:** Media | **Sprint:** 1

---

## Epic 2: Módulo de Cursos

### US-05 – Catálogo público de cursos
**Como** visitante,  
**Quiero** ver el catálogo de cursos con filtros,  
**Para** encontrar cursos que me interesen.

**Criterios de aceptación:**
- [ ] Listado de cursos publicados con: título, descripción corta, nivel, categoría, duración.
- [ ] Filtros por: nivel (beginner, intermediate, advanced), categoría, precio.
- [ ] Paginación (10 cursos por página).
- [ ] Buscador por título.

**Prioridad:** Alta | **Sprint:** 1

---

### US-06 – Detalle de curso
**Como** estudiante,  
**Quiero** ver el detalle de un curso,  
**Para** conocer su contenido antes de inscribirme.

**Criterios de aceptación:**
- [ ] Muestra: título, descripción completa, temario, requisitos, nivel, duración, instructor.
- [ ] Indica si el curso requiere un plan de suscripción específico.
- [ ] Muestra botón de inscripción si el usuario tiene acceso.

**Prioridad:** Alta | **Sprint:** 1

---

### US-07 – Crear/editar cursos (Instructor)
**Como** instructor,  
**Quiero** crear y editar mis propios cursos,  
**Para** gestionar mi contenido de enseñanza.

**Criterios de aceptación:**
- [ ] Formulario con: título, descripción, temario, duración, nivel, categoría, requisitos.
- [ ] Un instructor solo puede editar sus propios cursos.
- [ ] Los cursos creados quedan como "no publicados" por defecto.
- [ ] Validación de campos obligatorios.

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
- [ ] Se muestran los 3 planes: Basic, Pro, Premium.
- [ ] Cada plan muestra: nombre, precio, duración, max_courses, descripción.
- [ ] Indica si el plan es ilimitado (Premium).

**Prioridad:** Alta | **Sprint:** 2

---

### US-10 – Contratar suscripción
**Como** estudiante,  
**Quiero** suscribirme a un plan,  
**Para** acceder a los cursos según mi nivel de suscripción.

**Criterios de aceptación:**
- [ ] Selección de plan → redirección a pasarela de pago.
- [ ] Tras pago exitoso, se crea la suscripción con status `active`.
- [ ] Se calcula `end_date` automáticamente según `duration_days` del plan.
- [ ] Se registra el pago correspondiente.
- [ ] Notificación de confirmación.

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

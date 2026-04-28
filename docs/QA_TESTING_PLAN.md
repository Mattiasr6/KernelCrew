# Plan de Pruebas UAT (User Acceptance Testing)
**Proyecto:** CodeCore / KernelLearn  
**Versión:** MVP 1.3 (Full Compliance)  
**Fecha de Auditoría:** 28 de Abril de 2026  

---

## 🔐 1. Flujo de Seguridad y Autenticación (Auth & Recover)
**Objetivo:** Validar que el blindaje de acceso y la recuperación de cuenta funcionen bajo estrés.

- [ ] **Prueba de Error de Login:** Ingresar un correo mal formateado y una contraseña incorrecta.
    - *Resultado esperado:* El sistema muestra mensajes específicos debajo de cada campo (mapeo 422).
- [ ] **Prueba de Rate Limiting:** Intentar loguearse fallidamente 6 veces seguidas.
    - *Resultado esperado:* El sistema bloquea temporalmente las peticiones (HTTP 429).
- [ ] **Flujo de Recuperación (US-04):** Hacer clic en "¿Olvidaste tu contraseña?", ingresar el email y verificar el log del servidor (`storage/logs/laravel.log`) para obtener el link.
    - *Resultado esperado:* El link redirige al formulario de nueva clave y permite actualizarla con éxito.

---

## 👨‍🏫 2. Flujo del Instructor (Contenido y Gamificación)
**Objetivo:** Validar la creación de valor y la recompensa automática.

- [ ] **Creación de Curso:** Crear un curso con nivel `advanced` y guardarlo.
    - *Resultado esperado:* El curso aparece en la tabla con estado "Borrador".
- [ ] **Publicación y Créditos:** Publicar el curso (cambiar estado a `published`). Repetir hasta tener 3 cursos publicados.
    - *Resultado esperado:* Al tercer curso, el Dashboard del Instructor debe mostrar "+1 Crédito" ganado y una nueva actividad en el feed.
- [ ] **Protección de Edición:** Intentar editar un curso de otro instructor (vía URL ID).
    - *Resultado esperado:* El sistema bloquea el acceso mediante `CoursePolicy` (403 Forbidden).

---

## 💳 3. Flujo Comercial y Acceso Estricto (US-16)
**Objetivo:** Validar que la monetización y las restricciones de niveles sean infranqueables.

- [ ] **Compra de Plan Básico:** Ejecutar el checkout simulado del plan "Básico".
    - *Resultado esperado:* Toast de éxito neón y actualización del rol/estado en el `userSignal`.
- [ ] **Validación de Bloqueo (US-16):** Intentar inscribirse en un curso de nivel `Advanced` teniendo el plan `Básico`.
    - *Resultado esperado:* El sistema impide la inscripción y muestra un mensaje sugiriendo un upgrade a Pro/Enterprise.
- [ ] **Upgrade Exitoso:** Comprar el plan "Professional" e intentar inscribirse de nuevo al curso `Advanced`.
    - *Resultado esperado:* El sistema permite la inscripción exitosa.

---

## 🎓 4. Flujo de Graduación y Social Proof (US-23)
**Objetivo:** Validar el ciclo completo del estudiante y el feedback comunitario.

- [ ] **Aula Virtual:** Entrar al Player del curso, ver la barra de progreso al 0%.
- [ ] **Graduación:** Hacer clic en "Marcar lección como completada".
    - *Resultado esperado:* El progreso sube al 100%, se dispara la animación de éxito y aparece el botón dorado de descarga.
- [ ] **Certificado PDF:** Descargar el PDF y verificar que incluya el nombre, el curso y el código UUID único.
- [ ] **Reseña de Estrellas (US-23):** Dejar una calificación de 5 estrellas con un comentario neón.
    - *Resultado esperado:* El promedio del curso se actualiza automáticamente en el catálogo público.

---

## 🤖 5. Flujo KernelAI (US-24 y CA-15)
**Objetivo:** Validar la integración de IA y su dependencia comercial.

- [ ] **Validación Sub (CA-15):** Intentar usar el chat de IA con un usuario que NO tenga suscripción activa.
    - *Resultado esperado:* El backend rechaza la petición con un error 403.
- [ ] **Chat en Tiempo Real:** Usar el chat con una suscripción activa.
    - *Resultado esperado:* KernelAI responde coherentemente a preguntas sobre programación, manteniendo el contexto de la conversación.

---

## 📊 6. Flujo de Administración (Epic 6)
**Objetivo:** Validar la toma de decisiones basada en datos reales.

- [ ] **Buscador Blindado (US-03):** Buscar un usuario por email parcial.
    - *Resultado esperado:* La tabla se filtra usando el `scopeSearch` (blindaje contra SQLi).
- [ ] **Métricas de Negocio:** Verificar que el total de ingresos coincida con las suscripciones compradas en las pruebas anteriores.
    - *Resultado esperado:* Gráficos y tarjetas de stats actualizadas con datos 100% reales de la base de datos.

---
**Firma del Tester:** ________Pedrop-23___________________  
**Estado Final del UAT:** [ ] APROBADO / [ ] RECHAZADO

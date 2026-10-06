# Contexto del Proyecto: Sistema Operativo Inmobiliario (MVP)

## El Equipo
* **Dev 1 (Humano):** Líder de Backend y Lógica Frontend.
* **Dev 2 (Humano):** Líder de Base de Datos y Diseño Visual Frontend.
* **Gemini (IA):** Arquitecto de Software y planificador estratégico.
* **Claude (IA - Tú):** Asistente de código enfocado en ejecutar el backend.

**Alcance de Claude:** solo backend (NestJS). La base de datos la lleva Dev 2: no crear ni modificar `schema.prisma`, migraciones, seeds ni la configuración de Prisma, y no conectarse a la base. Tampoco frontend.

## Stack Tecnológico
* **Framework:** NestJS (Configurado con CommonJS).
* **Base de Datos:** PostgreSQL.
* **ORM:** Prisma.
* **Frontend (Próxima fase):** React (Diseño Web Responsivo / Mobile-First).

## Reglas Críticas de Arquitectura
1. **Arquitectura Multi-Tenant:** El sistema alojará 4 unidades de negocio (RE/MAX, Sastrería, Academia, Paco). Absolutamente todas las tablas/modelos principales en Prisma (Usuarios, Clientes, Propiedades, Expedientes) DEBEN incluir el campo `id_unidad_negocio`.
2. **Seguridad JWT:** Todos los endpoints (excepto webhooks públicos) deben estar protegidos por Guards de NestJS. El `id_unidad_negocio` vivirá dentro del payload del JWT para filtrar las consultas a la base de datos automáticamente.
3. **Estructura Estricta:** Respeta la modularidad de NestJS. Mantén los Controladores limpios (solo rutas) y delega la lógica a los Servicios.

## Autenticación (`src/auth`)
* `JwtAuthGuard` es global: toda ruta exige `Authorization: Bearer <jwt>` salvo las marcadas con `@Public()`.
* Payload del JWT: `{ sub, unidadNegocioId }`. El guard deja `{ usuarioId, unidadNegocioId }` en `request.user`; se lee con `@UsuarioActual()`.
* `AuthService.emitirToken()` firma el token. Falta el endpoint de login, que depende de la tabla de usuarios (Dev 2).
* Variables: `JWT_SECRET` (obligatoria) y `JWT_EXPIRES_IN` (por defecto `1h`). Ver `.env.example`.

## Tests
* `npm test` y `npm run test:e2e`. Los scripts pasan `--experimental-vm-modules` a Node porque los paquetes de NestJS 12 son ESM; `npx jest` directo falla.

## Estado Actual (Sprint 1)
Estamos levantando el proyecto base. Nuestras tareas inmediatas son:
1. Configurar la conexión inicial con Prisma.
2. Definir los modelos base en `schema.prisma`.
3. Crear el módulo de Autenticación (Auth) con JWT.
4. Generar los módulos CRUD base (Clientes, Propiedades, Expedientes).

Fecha límite de entrega del MVP: 30 de noviembre de 2026.
# Contexto del Proyecto: Sistema Operativo Inmobiliario (MVP)

## El Equipo
* **Dev 1 (Humano):** Líder de Backend y Lógica Frontend.
* **Dev 2 (Humano):** Líder de Base de Datos y Diseño Visual Frontend.
* **Gemini (IA):** Arquitecto de Software y planificador estratégico.
* **Claude (IA - Tú):** Asistente de código enfocado en ejecutar el backend.

## Stack Tecnológico
* **Framework:** NestJS (Configurado con CommonJS).
* **Base de Datos:** PostgreSQL.
* **ORM:** Prisma.
* **Frontend (Próxima fase):** React (Diseño Web Responsivo / Mobile-First).

## Reglas Críticas de Arquitectura
1. **Arquitectura Multi-Tenant:** El sistema alojará 4 unidades de negocio (RE/MAX, Sastrería, Academia, Paco). Absolutamente todas las tablas/modelos principales en Prisma (Usuarios, Clientes, Propiedades, Expedientes) DEBEN incluir el campo `id_unidad_negocio`.
2. **Seguridad JWT:** Todos los endpoints (excepto webhooks públicos) deben estar protegidos por Guards de NestJS. El `id_unidad_negocio` vivirá dentro del payload del JWT para filtrar las consultas a la base de datos automáticamente.
3. **Estructura Estricta:** Respeta la modularidad de NestJS. Mantén los Controladores limpios (solo rutas) y delega la lógica a los Servicios.

## Estado Actual (Sprint 1)
Estamos levantando el proyecto base. Nuestras tareas inmediatas son:
1. Configurar la conexión inicial con Prisma.
2. Definir los modelos base en `schema.prisma`.
3. Crear el módulo de Autenticación (Auth) con JWT.
4. Generar los módulos CRUD base (Clientes, Propiedades, Expedientes).

Fecha límite de entrega del MVP: 30 de noviembre de 2026.
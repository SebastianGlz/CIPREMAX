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
* Payload del JWT: `{ sub, unidadNegocioId, rol }`. El guard deja `{ usuarioId, unidadNegocioId, rol }` en `request.user`; se lee con `@UsuarioActual()`. Un token sin unidad o sin rol válido se rechaza con 401.
* Roles: `@Roles(Rol.ADMIN)` restringe una ruta o controlador (403 si no coincide); sin decorador basta con estar autenticado. Los valores de `Rol` (`src/auth/rol.ts`) son provisionales (`ADMIN`, `AGENTE`) y deben coincidir con el schema de Dev 2.
* Contraseñas: `PasswordService.hashear()` / `verificar()` (argon2id). Nunca guardar ni comparar contraseñas de otra forma.
* `@LimiteDeLogin()`: 10 intentos por minuto por IP (429 al excederlo), para login y rutas de credenciales. No hay límite global. Cuenta en memoria y por IP: detrás de un proxy hay que configurar `trust proxy`.
* `AuthService.emitirToken()` firma el token. Falta el endpoint de login, que depende de la tabla de usuarios (Dev 2).
* Variables: `JWT_SECRET` (obligatoria) y `JWT_EXPIRES_IN` (por defecto `1h`). Ver `.env.example`.

## Base HTTP
* Toda la API cuelga de `/api`. La configuración HTTP (prefijo, helmet, CORS, Swagger) vive en `configurarApp()` (`src/app.setup.ts`), que usan `main.ts` y los e2e.
* `ValidationPipe` global con `whitelist` y `forbidNonWhitelisted`: todo body debe tener un DTO con `class-validator`; los campos no declarados se rechazan con 400.
* Errores con una sola forma (`HttpExceptionFilter`): `{ statusCode, error, messages: string[], path, timestamp }`. En los servicios lanza excepciones de NestJS (`NotFoundException`, etc.).
* Las variables de entorno se validan al arrancar (`src/config/env.validation.ts`); una variable nueva se declara ahí y en `.env.example`.
* CORS solo se enciende para los orígenes de `CORS_ORIGIN`.
* Swagger en `/api/docs` (JSON en `/api/docs-json`), apagado con `NODE_ENV=production`. `NODE_ENV` es obligatoria (`development`, `production` o `test`): sin ella la app no arranca, para no publicar Swagger por descuido. El plugin de `@nestjs/swagger` en `nest-cli.json` documenta los DTO sin decoradores extra.
* `GET /api/health` es público.
* CI (`.github/workflows/ci.yml`): lint, build, tests unitarios y e2e en cada PR y en cada push a `master`.

## Versión de Node
* Node 24.8 o superior (`engines` en `package.json`, `.nvmrc` con `24`; el CI lee el `.nvmrc`). Con Node 22 o con un 24 anterior a 24.8, los tests fallan con "Must use import to load ES Module".
* Al tocar dependencias, comprueba que el lockfile conserve `@emnapi/core` y `@emnapi/runtime`. npm 11.6 las borra y el `npm ci` del CI lo rechaza. Si desaparecen, regenera el lockfile con `npx npm@11.21 install`.

## Tests
* `npm test` y `npm run test:e2e`. Los scripts pasan `--experimental-vm-modules` a Node porque los paquetes de NestJS 12 son ESM; `npx jest` directo falla.

## Estado Actual (Sprint 1)
Estamos levantando el proyecto base. Nuestras tareas inmediatas son:
1. Configurar la conexión inicial con Prisma.
2. Definir los modelos base en `schema.prisma`.
3. Crear el módulo de Autenticación (Auth) con JWT.
4. Generar los módulos CRUD base (Clientes, Propiedades, Expedientes).

Fecha límite de entrega del MVP: 30 de noviembre de 2026.
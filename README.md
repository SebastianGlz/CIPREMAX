# CIPREMAX — Backend

API del Sistema Operativo Inmobiliario: un backend multi-tenant en NestJS que da servicio a cuatro unidades de negocio (RE/MAX, Sastrería, Academia y Paco). Cada usuario trabaja dentro de una unidad, y la API filtra los datos por esa unidad a partir del JWT.

**Stack:** NestJS 12 · PostgreSQL · Prisma · JWT (HS256) · argon2id

## Requisitos

- **Node.js 24.8 o superior** (con npm 11). Hay un `.nvmrc`; con nvm basta `nvm use`.
  NestJS 12 se distribuye como ESM y Jest solo lo carga desde Node 24.8: con Node 22 o con un 24 anterior, los tests fallan con `Must use import to load ES Module`.
- Usa la misma versión de npm que el resto del equipo. Un `package-lock.json` generado con otra versión puede hacer que `npm ci` falle en el CI.

## Puesta en marcha

```bash
npm ci
cp .env.example .env   # y rellena JWT_SECRET
npm run start:dev
```

La API queda en `http://localhost:3000/api`. Para comprobar que responde, usa `GET /api/health`.

## Variables de entorno

El servidor no arranca si falta alguna variable obligatoria o si tiene un valor inválido. Todas están documentadas en [`.env.example`](.env.example).

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `NODE_ENV` | Sí | `development`, `production` o `test`. Fuera de `production` se publica Swagger. |
| `JWT_SECRET` | Sí | Secreto para firmar los JWT, de 32 caracteres como mínimo. |
| `JWT_EXPIRES_IN` | No | Vigencia del token. Por defecto `1h`. |
| `PORT` | No | Puerto HTTP. Por defecto `3000`. |
| `CORS_ORIGIN` | No | Orígenes del frontend separados por coma. Sin valor, CORS queda apagado. |

Para generar un `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Documentación de la API

Con `NODE_ENV` distinto de `production`, Swagger está en `http://localhost:3000/api/docs` y el contrato en JSON en `/api/docs-json`.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run start:dev` | Arranca el servidor en modo watch. |
| `npm run build` / `npm run start:prod` | Compila a `dist/` y arranca la versión compilada. |
| `npm run lint` | Pasa oxlint por `src/` y `test/`. |
| `npm test` | Corre los tests unitarios. |
| `npm run test:e2e` | Corre los tests end-to-end. |
| `npm run test:cov` | Corre los tests unitarios con cobertura. |

No lances los tests con `npx jest`: fallan. Los scripts de npm le pasan `--experimental-vm-modules` a Node, que hace falta para cargar los módulos ESM.

## CI

GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) corre lint, build, tests unitarios y e2e en cada pull request y en cada push a `master`. Usa la versión de Node del `.nvmrc`.

## Convenciones

Las reglas de arquitectura del proyecto están en [`CLAUDE.md`](CLAUDE.md): multi-tenant, autenticación, roles y la forma de las respuestas de error.

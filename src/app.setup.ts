import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

export const PREFIJO_API = 'api';
export const RUTA_DOCS = `${PREFIJO_API}/docs`;

function configurarSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Sistema Operativo Inmobiliario')
    .setVersion('0.0.1')
    .addBearerAuth()
    // El guard de JWT es global, así que el candado aplica a toda la API.
    .addSecurityRequirements('bearer')
    .build();

  SwaggerModule.setup(
    RUTA_DOCS,
    app,
    SwaggerModule.createDocument(app, config),
  );
}

/**
 * Configuración HTTP compartida por `main.ts` y los tests e2e. Debe llamarse
 * antes de `app.init()` / `app.listen()`.
 */
export function configurarApp(app: INestApplication): void {
  const config = app.get(ConfigService);

  app.setGlobalPrefix(PREFIJO_API);
  app.use(helmet());

  const origenes = config
    .get<string>('CORS_ORIGIN', '')
    .split(',')
    .map((origen) => origen.trim())
    .filter(Boolean);
  if (origenes.length > 0) app.enableCors({ origin: origenes });

  if (config.get('NODE_ENV') !== 'production') configurarSwagger(app);
}

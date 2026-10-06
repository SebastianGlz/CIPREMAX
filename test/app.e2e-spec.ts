import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configurarApp } from './../src/app.setup';
import { AuthService } from './../src/auth/auth.service';

describe('App (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configurarApp(app);
    await app.init();
  });

  it('/api/health (GET) es público', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect({ status: 'ok' });
  });

  it('/api/auth/me (GET) exige token y responde con el formato de error', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/api/auth/me')
      .expect(401);

    expect(respuesta.body).toMatchObject({
      statusCode: 401,
      error: 'Unauthorized',
      messages: ['Unauthorized'],
      path: '/api/auth/me',
    });
  });

  it('/api/auth/me (GET) devuelve el usuario del token', async () => {
    const usuario = { usuarioId: 'u1', unidadNegocioId: 'n1' };
    const token = await app.get(AuthService).emitirToken(usuario);

    return request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect(usuario);
  });

  it('las rutas inexistentes responden 404 con el formato de error', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/api/no-existe')
      .expect(404);

    expect(respuesta.body).toMatchObject({
      statusCode: 404,
      error: 'Not Found',
      path: '/api/no-existe',
    });
    expect(respuesta.body.messages).toHaveLength(1);
  });

  it('aplica las cabeceras de seguridad de helmet', async () => {
    const respuesta = await request(app.getHttpServer()).get('/api/health');
    expect(respuesta.headers['x-content-type-options']).toBe('nosniff');
    expect(respuesta.headers['x-powered-by']).toBeUndefined();
  });

  it('/api/docs-json (GET) publica el contrato con seguridad Bearer', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/api/docs-json')
      .expect(200);

    expect(Object.keys(respuesta.body.paths)).toEqual(
      expect.arrayContaining(['/api/health', '/api/auth/me']),
    );
    expect(respuesta.body.components.securitySchemes.bearer).toMatchObject({
      type: 'http',
      scheme: 'bearer',
    });
  });

  afterEach(async () => {
    await app.close();
  });
});

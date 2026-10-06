import { Controller, Get, INestApplication, Post } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configurarApp } from './../src/app.setup';
import { AuthService } from './../src/auth/auth.service';
import {
  INTENTOS_DE_LOGIN_POR_MINUTO,
  LimiteDeLogin,
} from './../src/auth/limite-de-login.decorator';
import { Public } from './../src/auth/public.decorator';
import { Rol } from './../src/auth/rol';
import { Roles } from './../src/auth/roles.decorator';

// Rutas solo para estos tests: ejercitan los decoradores de auth con los
// guards reales, mientras no exista el login.
@Controller('pruebas')
class ControladorDePruebas {
  @Roles(Rol.ADMIN)
  @Get('solo-admin')
  soloAdmin() {
    return { ok: true };
  }

  @Public()
  @LimiteDeLogin()
  @Post('login')
  login() {
    return { ok: true };
  }
}

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [ControladorDePruebas],
    }).compile();

    app = moduleFixture.createNestApplication();
    configurarApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  function tokenCon(rol: Rol) {
    return app
      .get(AuthService)
      .emitirToken({ usuarioId: 'u1', unidadNegocioId: 'n1', rol });
  }

  describe('@Roles()', () => {
    it('responde 401 sin token', () => {
      return request(app.getHttpServer())
        .get('/api/pruebas/solo-admin')
        .expect(401);
    });

    it('responde 403 a un rol no permitido', async () => {
      const respuesta = await request(app.getHttpServer())
        .get('/api/pruebas/solo-admin')
        .set('Authorization', `Bearer ${await tokenCon(Rol.AGENTE)}`)
        .expect(403);

      expect(respuesta.body).toMatchObject({
        statusCode: 403,
        error: 'Forbidden',
      });
    });

    it('deja pasar al rol requerido', async () => {
      return request(app.getHttpServer())
        .get('/api/pruebas/solo-admin')
        .set('Authorization', `Bearer ${await tokenCon(Rol.ADMIN)}`)
        .expect(200)
        .expect({ ok: true });
    });
  });

  describe('@LimiteDeLogin()', () => {
    it('responde 429 al exceder los intentos por minuto', async () => {
      for (let i = 0; i < INTENTOS_DE_LOGIN_POR_MINUTO; i++) {
        await request(app.getHttpServer())
          .post('/api/pruebas/login')
          .expect(201);
      }

      const respuesta = await request(app.getHttpServer())
        .post('/api/pruebas/login')
        .expect(429);
      expect(respuesta.body).toMatchObject({
        statusCode: 429,
        error: 'Too Many Requests',
      });
    });

    it('no limita las rutas sin el decorador', async () => {
      for (let i = 0; i < INTENTOS_DE_LOGIN_POR_MINUTO + 5; i++) {
        await request(app.getHttpServer()).get('/api/health').expect(200);
      }
    });
  });
});

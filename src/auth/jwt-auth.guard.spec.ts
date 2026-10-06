import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Public } from './public.decorator';
import { Rol } from './rol';
import { RequestAutenticado } from './usuario-autenticado';

class ControladorDePrueba {
  protegida() {}

  @Public()
  publica() {}
}

const PAYLOAD = { sub: 'u1', unidadNegocioId: 'n1', rol: Rol.AGENTE };

describe('JwtAuthGuard', () => {
  const jwtService = new JwtService({ secret: 'secreto-de-prueba' });
  const guard = new JwtAuthGuard(jwtService, new Reflector());

  function contexto(
    authorization?: string,
    handler: () => void = ControladorDePrueba.prototype.protegida,
  ) {
    const request = { headers: { authorization } } as RequestAutenticado;
    const context = {
      getHandler: () => handler,
      getClass: () => ControladorDePrueba,
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
    return { context, request };
  }

  async function esperarRechazo(authorization?: string) {
    await expect(
      guard.canActivate(contexto(authorization).context),
    ).rejects.toThrow(UnauthorizedException);
  }

  it('deja pasar rutas @Public() sin token', async () => {
    const { context, request } = contexto(
      undefined,
      ControladorDePrueba.prototype.publica,
    );
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toBeUndefined();
  });

  it('rechaza peticiones sin token', async () => {
    await esperarRechazo();
  });

  it('rechaza esquemas distintos de Bearer', async () => {
    await esperarRechazo(`Basic ${await jwtService.signAsync(PAYLOAD)}`);
  });

  it('rechaza tokens firmados con otro secreto', async () => {
    const token = await new JwtService({ secret: 'otro' }).signAsync(PAYLOAD);
    await esperarRechazo(`Bearer ${token}`);
  });

  it('rechaza tokens expirados', async () => {
    const token = await jwtService.signAsync(PAYLOAD, { expiresIn: -10 });
    await esperarRechazo(`Bearer ${token}`);
  });

  it('rechaza tokens sin unidad de negocio', async () => {
    const token = await jwtService.signAsync({ sub: 'u1', rol: Rol.ADMIN });
    await esperarRechazo(`Bearer ${token}`);
  });

  it('rechaza tokens sin rol o con un rol desconocido', async () => {
    const sinRol = await jwtService.signAsync({
      sub: 'u1',
      unidadNegocioId: 'n1',
    });
    const rolInventado = await jwtService.signAsync({
      ...PAYLOAD,
      rol: 'SUPERADMIN',
    });
    await esperarRechazo(`Bearer ${sinRol}`);
    await esperarRechazo(`Bearer ${rolInventado}`);
  });

  it('deja usuario, unidad de negocio y rol en request.user', async () => {
    const { context, request } = contexto(
      `Bearer ${await jwtService.signAsync(PAYLOAD)}`,
    );

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual({
      usuarioId: 'u1',
      unidadNegocioId: 'n1',
      rol: Rol.AGENTE,
    });
  });
});

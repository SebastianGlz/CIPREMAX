import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Public } from './public.decorator';
import { RequestAutenticado } from './usuario-autenticado';

class ControladorDePrueba {
  protegida() {}

  @Public()
  publica() {}
}

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

  it('deja pasar rutas @Public() sin token', async () => {
    const { context, request } = contexto(
      undefined,
      ControladorDePrueba.prototype.publica,
    );
    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toBeUndefined();
  });

  it('rechaza peticiones sin token', async () => {
    await expect(guard.canActivate(contexto().context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rechaza esquemas distintos de Bearer', async () => {
    const token = await jwtService.signAsync({
      sub: 'u1',
      unidadNegocioId: 'n1',
    });
    await expect(
      guard.canActivate(contexto(`Basic ${token}`).context),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rechaza tokens firmados con otro secreto', async () => {
    const token = await new JwtService({ secret: 'otro' }).signAsync({
      sub: 'u1',
      unidadNegocioId: 'n1',
    });
    await expect(
      guard.canActivate(contexto(`Bearer ${token}`).context),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rechaza tokens expirados', async () => {
    const token = await jwtService.signAsync(
      { sub: 'u1', unidadNegocioId: 'n1' },
      { expiresIn: -10 },
    );
    await expect(
      guard.canActivate(contexto(`Bearer ${token}`).context),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rechaza tokens sin unidad de negocio', async () => {
    const token = await jwtService.signAsync({ sub: 'u1' });
    await expect(
      guard.canActivate(contexto(`Bearer ${token}`).context),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('deja el usuario y su unidad de negocio en request.user', async () => {
    const token = await jwtService.signAsync({
      sub: 'u1',
      unidadNegocioId: 'n1',
    });
    const { context, request } = contexto(`Bearer ${token}`);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual({ usuarioId: 'u1', unidadNegocioId: 'n1' });
  });
});

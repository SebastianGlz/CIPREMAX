import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Rol } from './rol';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { UsuarioAutenticado } from './usuario-autenticado';

class ControladorDePrueba {
  sinRoles() {}

  @Roles(Rol.ADMIN)
  soloAdmin() {}

  @Roles(Rol.ADMIN, Rol.AGENTE)
  adminOAgente() {}
}

@Roles(Rol.ADMIN)
class ControladorSoloAdmin {
  heredada() {}

  @Roles(Rol.AGENTE)
  sobrescrita() {}
}

describe('RolesGuard', () => {
  const guard = new RolesGuard(new Reflector());

  function contexto(
    handler: () => void,
    rol?: Rol,
    clase: new () => unknown = ControladorDePrueba,
  ) {
    const user: UsuarioAutenticado | undefined = rol && {
      usuarioId: 'u1',
      unidadNegocioId: 'n1',
      rol,
    };
    return {
      getHandler: () => handler,
      getClass: () => clase,
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    } as unknown as ExecutionContext;
  }

  const { sinRoles, soloAdmin, adminOAgente } = ControladorDePrueba.prototype;

  it('deja pasar rutas sin @Roles()', () => {
    expect(guard.canActivate(contexto(sinRoles, Rol.AGENTE))).toBe(true);
    expect(guard.canActivate(contexto(sinRoles))).toBe(true);
  });

  it('deja pasar al rol requerido', () => {
    expect(guard.canActivate(contexto(soloAdmin, Rol.ADMIN))).toBe(true);
    expect(guard.canActivate(contexto(adminOAgente, Rol.AGENTE))).toBe(true);
  });

  it('rechaza con 403 a un rol no permitido', () => {
    expect(() => guard.canActivate(contexto(soloAdmin, Rol.AGENTE))).toThrow(
      ForbiddenException,
    );
  });

  it('rechaza si la ruta pide roles y no hay usuario', () => {
    expect(() => guard.canActivate(contexto(soloAdmin))).toThrow(
      ForbiddenException,
    );
  });

  it('aplica @Roles() del controlador y el del método lo sobrescribe', () => {
    const { heredada, sobrescrita } = ControladorSoloAdmin.prototype;

    expect(() =>
      guard.canActivate(contexto(heredada, Rol.AGENTE, ControladorSoloAdmin)),
    ).toThrow(ForbiddenException);
    expect(
      guard.canActivate(
        contexto(sobrescrita, Rol.AGENTE, ControladorSoloAdmin),
      ),
    ).toBe(true);
  });
});

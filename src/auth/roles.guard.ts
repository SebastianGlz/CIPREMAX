import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Rol } from './rol';
import { ROLES_REQUERIDOS } from './roles.decorator';
import { RequestAutenticado } from './usuario-autenticado';

/** Debe registrarse después de JwtAuthGuard, que es quien llena `request.user`. */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Rol[] | undefined>(
      ROLES_REQUERIDOS,
      [context.getHandler(), context.getClass()],
    );
    if (!roles || roles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest<RequestAutenticado>();
    if (!user || !roles.includes(user.rol)) throw new ForbiddenException();
    return true;
  }
}

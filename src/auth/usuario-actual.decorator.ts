import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestAutenticado } from './usuario-autenticado';

/** Inyecta el usuario autenticado que dejó el guard de JWT. */
export const UsuarioActual = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    context.switchToHttp().getRequest<RequestAutenticado>().user,
);

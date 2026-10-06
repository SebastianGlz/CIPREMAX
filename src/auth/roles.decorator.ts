import { SetMetadata } from '@nestjs/common';
import { Rol } from './rol';

export const ROLES_REQUERIDOS = 'rolesRequeridos';

/**
 * Restringe una ruta (o un controlador completo) a los roles indicados. Sin
 * este decorador basta con estar autenticado.
 */
export const Roles = (...roles: Rol[]) => SetMetadata(ROLES_REQUERIDOS, roles);

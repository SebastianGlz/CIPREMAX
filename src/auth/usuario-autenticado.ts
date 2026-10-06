import type { Request } from 'express';
import { esRol, Rol } from './rol';

/**
 * Contenido del JWT. `unidadNegocioId` es la unidad de negocio activa y `rol`
 * el rol del usuario dentro de ella.
 */
export interface JwtPayload {
  sub: string;
  unidadNegocioId: string;
  rol: Rol;
}

/** Lo que el guard deja en `request.user`. */
export interface UsuarioAutenticado {
  usuarioId: string;
  unidadNegocioId: string;
  rol: Rol;
}

export type RequestAutenticado = Request & { user?: UsuarioAutenticado };

export function esJwtPayload(valor: unknown): valor is JwtPayload {
  if (typeof valor !== 'object' || valor === null) return false;
  const { sub, unidadNegocioId, rol } = valor as Record<string, unknown>;
  return (
    typeof sub === 'string' &&
    sub.length > 0 &&
    typeof unidadNegocioId === 'string' &&
    unidadNegocioId.length > 0 &&
    esRol(rol)
  );
}

import type { Request } from 'express';

/** Contenido del JWT. `unidadNegocioId` es la unidad de negocio activa. */
export interface JwtPayload {
  sub: string;
  unidadNegocioId: string;
}

/** Lo que el guard deja en `request.user`. */
export interface UsuarioAutenticado {
  usuarioId: string;
  unidadNegocioId: string;
}

export type RequestAutenticado = Request & { user?: UsuarioAutenticado };

export function esJwtPayload(valor: unknown): valor is JwtPayload {
  if (typeof valor !== 'object' || valor === null) return false;
  const { sub, unidadNegocioId } = valor as Record<string, unknown>;
  return (
    typeof sub === 'string' &&
    sub.length > 0 &&
    typeof unidadNegocioId === 'string' &&
    unidadNegocioId.length > 0
  );
}

import { applyDecorators, UseGuards } from '@nestjs/common';
import { minutes, Throttle, ThrottlerGuard } from '@nestjs/throttler';

export const INTENTOS_DE_LOGIN_POR_MINUTO = 10;

/**
 * Limita los intentos por IP en rutas de credenciales (login, recuperar
 * contraseña). Al excederlo responde 429. El conteo vive en memoria, por
 * proceso; con varias instancias hará falta un almacenamiento compartido.
 */
export const LimiteDeLogin = () =>
  applyDecorators(
    UseGuards(ThrottlerGuard),
    Throttle({
      default: { limit: INTENTOS_DE_LOGIN_POR_MINUTO, ttl: minutes(1) },
    }),
  );

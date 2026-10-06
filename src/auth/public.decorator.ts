import { SetMetadata } from '@nestjs/common';

export const ES_PUBLICO = 'esPublico';

/**
 * Exime una ruta (o un controlador completo) del guard de JWT. Solo para
 * login y webhooks públicos; estos últimos deben validar la firma del proveedor.
 */
export const Public = () => SetMetadata(ES_PUBLICO, true);

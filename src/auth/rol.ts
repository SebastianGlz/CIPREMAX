/**
 * Rol del usuario dentro de su unidad de negocio activa. Debe coincidir con
 * los valores que defina el schema de la base de datos.
 */
export enum Rol {
  ADMIN = 'ADMIN',
  AGENTE = 'AGENTE',
}

export function esRol(valor: unknown): valor is Rol {
  return Object.values(Rol).includes(valor as Rol);
}

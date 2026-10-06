import { Controller, Get } from '@nestjs/common';
import { UsuarioActual } from './usuario-actual.decorator';
import type { UsuarioAutenticado } from './usuario-autenticado';

@Controller('auth')
export class AuthController {
  @Get('me')
  me(@UsuarioActual() usuario: UsuarioAutenticado): UsuarioAutenticado {
    return usuario;
  }
}

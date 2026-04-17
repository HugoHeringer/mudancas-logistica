import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_SUPER_ADMIN_KEY } from '../decorators/super-admin.decorator';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isSuperAdmin = this.reflector.getAllAndOverride<boolean>(IS_SUPER_ADMIN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!isSuperAdmin) {
      return true; // Not a super-admin endpoint, skip this guard
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('Autenticação necessária');
    }

    // Super-admin users are identified by a specific email domain or a flag
    // For now, users with perfil 'super_admin' or email ending with @platform.pt
    const isSuperAdminUser =
      user.perfil === 'super_admin' ||
      user.email?.endsWith('@mudancas-logistica.pt') ||
      user.email?.endsWith('@plataforma.pt');

    if (!isSuperAdminUser) {
      throw new ForbiddenException('Acesso restrito ao Super-Admin');
    }

    return true;
  }
}

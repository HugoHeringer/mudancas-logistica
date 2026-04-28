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

    // Super-admin users are identified by isSuperAdmin flag on User model
    const isSuperAdminUser =
      user.isSuperAdmin === true ||
      user.perfil === 'super_admin' ||
      user.email?.endsWith('@mudancas-logistica.pt') ||
      user.email?.endsWith('@movefy.pt');

    if (!isSuperAdminUser) {
      throw new ForbiddenException('Acesso restrito ao Movefy Console');
    }

    return true;
  }
}

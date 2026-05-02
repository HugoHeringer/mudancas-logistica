import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const authenticated = (await super.canActivate(context)) as boolean;
    if (!authenticated) return false;

    // Nota: a verificação de estado do tenant (trial, bloqueado, etc.)
    // é feita pelo TenantActiveGuard, que corre depois deste guard.
    // Aqui só validamos que o JWT é válido.

    return true;
  }
}

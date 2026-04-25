import {
  Injectable,
  NestMiddleware,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

export interface TenantRequest extends Request {
  tenantId?: string;
  tenantSlug?: string;
}

@Injectable()
export class TenantResolveMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: TenantRequest, res: Response, next: NextFunction) {
    // Skip routes that are not tenant-scoped
    const skipPrefixes = ['/api/health', '/api/docs', '/api/swagger', '/api/auth', '/api/super-admin'];
    if (skipPrefixes.some((prefix) => req.path.startsWith(prefix))) {
      return next();
    }

    // 1. Read 'host' header — e.g. "silva-mudancas.movefy.pt"
    const host = req.headers.host || '';
    const hostname = host.split(':')[0]; // strip port

    // 2. Extract subdomain — everything before the main domain
    //    For "silva-mudancas.movefy.pt" → "silva-mudancas"
    //    For "localhost" or direct IP → skip
    const parts = hostname.split('.');

    // Need at least subdomain.domain.tld (3 parts) to extract a subdomain
    if (parts.length < 3) {
      // No subdomain detectable (localhost, IP, or bare domain) — skip resolution
      return next();
    }

    const subdomain = parts[0];

    // 3. Skip reserved subdomains
    const reserved = ['console', 'www', 'api', 'admin', 'app'];
    if (reserved.includes(subdomain)) {
      return next();
    }

    // 4. Resolve tenant by slug (or subdomain field)
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        OR: [{ slug: subdomain }, { subdomain }],
        eAtivo: true,
      },
      select: { id: true, slug: true },
    });

    if (!tenant) {
      throw new NotFoundException('Empresa não encontrada');
    }

    // 5. Attach to request
    req.tenantId = tenant.id;
    req.tenantSlug = tenant.slug || subdomain;

    next();
  }
}

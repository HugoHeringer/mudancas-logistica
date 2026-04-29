import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { IsEmail, IsNotEmpty, MinLength, Matches } from 'class-validator';
import { SuperAdminService } from './super-admin.service';
import { CreateTenantDto } from '../tenant/dto/create-tenant.dto';
import { IsSuperAdmin } from '../auth/decorators/super-admin.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('super-admin')
@Controller('super-admin')
@ApiBearerAuth()
@IsSuperAdmin()
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Get('tenants')
  @ApiOperation({ summary: 'Listar todos os tenants (Movefy Console)' })
  getAllTenants() {
    return this.superAdminService.getAllTenants();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estatísticas globais da plataforma' })
  getStats() {
    return this.superAdminService.getTenantStats();
  }

  @Post('tenants')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo tenant com admin (Movefy Console)' })
  createTenantWithAdmin(@Body() body: CreateTenantDto & {
    adminNome: string;
    adminEmail: string;
    adminPassword: string;
  }) {
    return this.superAdminService.createTenantWithAdmin(body);
  }

  @Patch('tenants/:id/estado')
  @ApiOperation({ summary: 'Atualizar estado do tenant' })
  updateTenantEstado(
    @Param('id') id: string,
    @Body() body: { estado: string },
  ) {
    return this.superAdminService.updateTenantEstado(id, body.estado);
  }

  @Post('tenants/:id/reset-password')
  @ApiOperation({ summary: 'Redefinir senha do admin do tenant' })
  resetAdminPassword(
    @Param('id') id: string,
    @Body() body: { newPassword: string },
  ) {
    return this.superAdminService.resetAdminPassword(id, body.newPassword);
  }

  @Delete('tenants/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover tenant' })
  deleteTenant(@Param('id') id: string) {
    return this.superAdminService.deleteTenant(id);
  }
}

// ─────────────────────────────────────────────────────────────
// Controlador público — sem guard de super-admin nem JWT
// ─────────────────────────────────────────────────────────────
@ApiTags('public-trial')
@Controller('super-admin/trial')
export class TrialController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 3, ttl: 3600000 } })
  @ApiOperation({ summary: 'Criar conta trial pública (site movefy.pt)' })
  criarTrial(
    @Body() body: { nomeEmpresa: string; email: string; telefone: string },
  ) {
    return this.superAdminService.criarTrial(body);
  }
}

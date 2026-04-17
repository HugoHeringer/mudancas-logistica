import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UtilizadorService } from './utilizador.service';
import { TenantRequest, getTenantId } from '../prisma';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('utilizadores')
@Controller('utilizadores')
@ApiBearerAuth()
@Roles('admin')
export class UtilizadorController {
  constructor(private readonly utilizadorService: UtilizadorService) {}

  @Get()
  @ApiOperation({ summary: 'Listar utilizadores do tenant' })
  findAll(@Request() req: TenantRequest, @Query() filters: any) {
    return this.utilizadorService.findAll(getTenantId(req), filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um utilizador' })
  findOne(@Request() req: TenantRequest, @Param('id') id: string) {
    return this.utilizadorService.findOne(getTenantId(req), id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar nome/email do utilizador' })
  update(
    @Request() req: TenantRequest,
    @Param('id') id: string,
    @Body() body: { nome?: string; email?: string },
  ) {
    return this.utilizadorService.update(getTenantId(req), id, body);
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Ativar/desativar utilizador' })
  updateEstado(
    @Request() req: TenantRequest,
    @Param('id') id: string,
    @Body() body: { eAtivo: boolean },
  ) {
    return this.utilizadorService.updateEstado(getTenantId(req), id, body.eAtivo);
  }

  @Patch(':id/perfil')
  @ApiOperation({ summary: 'Alterar perfil do utilizador' })
  updatePerfil(
    @Request() req: TenantRequest,
    @Param('id') id: string,
    @Body() body: { perfil: string },
  ) {
    return this.utilizadorService.updatePerfil(getTenantId(req), id, body.perfil);
  }

  @Patch(':id/permissoes')
  @ApiOperation({ summary: 'Alterar permissões do utilizador' })
  updatePermissoes(
    @Request() req: TenantRequest,
    @Param('id') id: string,
    @Body() body: { permissoes: any },
  ) {
    return this.utilizadorService.updatePermissoes(getTenantId(req), id, body.permissoes);
  }
}

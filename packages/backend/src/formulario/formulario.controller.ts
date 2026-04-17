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
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FormularioService } from './formulario.service';
import { CreateCampoDto } from './dto/create-campo.dto';
import { UpdateCampoDto } from './dto/update-campo.dto';
import { ReorderCamposDto } from './dto/reorder-campo.dto';
import { TenantRequest, getTenantId } from '../prisma';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('formulario')
@Controller('formulario')
@ApiBearerAuth()
@Roles('admin')
export class FormularioController {
  constructor(private readonly formularioService: FormularioService) {}

  @Post('campos')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar campo do formulário' })
  create(@Request() req: TenantRequest, @Body() dto: CreateCampoDto) {
    return this.formularioService.create(getTenantId(req), dto);
  }

  @Get('campos')
  @ApiOperation({ summary: 'Listar campos do formulário' })
  findAll(@Request() req: TenantRequest) {
    return this.formularioService.findAll(getTenantId(req));
  }

  @Get('campos/ativos')
  @ApiOperation({ summary: 'Listar campos ativos do formulário' })
  findAtivos(@Request() req: TenantRequest) {
    return this.formularioService.findAtivos(getTenantId(req));
  }

  @Post('campos/seed')
  @ApiOperation({ summary: 'Criar campos base do sistema' })
  seedBaseFields(@Request() req: TenantRequest) {
    return this.formularioService.seedBaseFields(getTenantId(req));
  }

  @Patch('campos/:id')
  @ApiOperation({ summary: 'Atualizar campo do formulário' })
  update(
    @Request() req: TenantRequest,
    @Param('id') id: string,
    @Body() dto: UpdateCampoDto,
  ) {
    return this.formularioService.update(getTenantId(req), id, dto);
  }

  @Patch('campos/:id/toggle')
  @ApiOperation({ summary: 'Ativar/desativar campo' })
  toggleAtivo(@Request() req: TenantRequest, @Param('id') id: string) {
    return this.formularioService.toggleAtivo(getTenantId(req), id);
  }

  @Patch('campos/reorder')
  @ApiOperation({ summary: 'Reordenar campos do formulário' })
  reorder(@Request() req: TenantRequest, @Body() dto: ReorderCamposDto) {
    return this.formularioService.reorder(getTenantId(req), dto);
  }

  @Delete('campos/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover campo do formulário' })
  remove(@Request() req: TenantRequest, @Param('id') id: string) {
    return this.formularioService.remove(getTenantId(req), id);
  }
}

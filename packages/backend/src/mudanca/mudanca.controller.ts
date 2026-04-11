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
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  Request,
} from '@nestjs/common';
import { MudancaService } from './mudanca.service';
import { CreateMudancaDto } from './dto/create-mudanca.dto';
import { UpdateMudancaDto } from './dto/update-mudanca.dto';
import { AprovarMudancaDto } from './dto/aprovar-mudanca.dto';
import { ConcluirMudancaDto } from './dto/concluir-mudanca.dto';
import { TenantRequest } from '../prisma/prisma.middleware';

@ApiTags('mudancas')
@Controller('mudancas')
@ApiBearerAuth()
export class MudancaController {
  constructor(private readonly mudancaService: MudancaService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar nova mudança (público ou admin)' })
  create(@Request() req: TenantRequest, @Body() createMudancaDto: CreateMudancaDto) {
    const tenantId = req.tenantId || createMudancaDto.tenantId;
    return this.mudancaService.create(tenantId, createMudancaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as mudanças (com filtros)' })
  findAll(@Request() req: TenantRequest) {
    const tenantId = req.tenantId;
    const filters = req.query as any;
    return this.mudancaService.findAll(tenantId, filters);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Obter dados para dashboard' })
  getDashboard(@Request() req: TenantRequest) {
    return this.mudancaService.getDashboard(req.tenantId);
  }

  @Get('minhas')
  @ApiOperation({ summary: 'Obter mudanças do motorista autenticado' })
  getMinhas(@Request() req: TenantRequest, @Query() filters: any) {
    return this.mudancaService.getMinhas(req.tenantId, req.user.id, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter mudança por ID' })
  findOne(@Request() req: TenantRequest, @Param('id') id: string) {
    return this.mudancaService.findOne(req.tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar mudança' })
  update(
    @Request() req: TenantRequest,
    @Param('id') id: string,
    @Body() updateMudancaDto: UpdateMudancaDto,
  ) {
    return this.mudancaService.update(req.tenantId, id, updateMudancaDto);
  }

  @Post(':id/aprovar')
  @ApiOperation({ summary: 'Aprovar mudança e atribuir motorista' })
  aprovar(
    @Request() req: TenantRequest,
    @Param('id') id: string,
    @Body() aprovarMudancaDto: AprovarMudancaDto,
  ) {
    return this.mudancaService.aprovar(req.tenantId, id, aprovarMudancaDto);
  }

  @Post(':id/iniciar')
  @ApiOperation({ summary: 'Motorista inicia deslocamento' })
  iniciarDeslocamento(@Request() req: TenantRequest, @Param('id') id: string) {
    return this.mudancaService.iniciarDeslocamento(req.tenantId, id, req.user.id);
  }

  @Post(':id/em-servico')
  @ApiOperation({ summary: 'Motorista inicia serviço no local' })
  emServico(@Request() req: TenantRequest, @Param('id') id: string) {
    return this.mudancaService.emServico(req.tenantId, id, req.user.id);
  }

  @Post(':id/concluir')
  @ApiOperation({ summary: 'Concluir mudança com ficha' })
  concluir(
    @Request() req: TenantRequest,
    @Param('id') id: string,
    @Body() concluirMudancaDto: ConcluirMudancaDto,
  ) {
    return this.mudancaService.concluir(req.tenantId, id, concluirMudancaDto);
  }

  @Post(':id/recusar')
  @ApiOperation({ summary: 'Recusar mudança' })
  recusar(@Request() req: TenantRequest, @Param('id') id: string, @Body() body: { motivo: string }) {
    return this.mudancaService.recusar(req.tenantId, id, body.motivo);
  }

  @Post(':id/cancelar')
  @ApiOperation({ summary: 'Cancelar mudança' })
  cancelar(@Request() req: TenantRequest, @Param('id') id: string) {
    return this.mudancaService.cancelar(req.tenantId, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover mudança' })
  remove(@Request() req: TenantRequest, @Param('id') id: string) {
    return this.mudancaService.remove(req.tenantId, id);
  }
}

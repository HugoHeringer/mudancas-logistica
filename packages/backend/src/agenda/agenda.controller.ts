import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Request,
  Query,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AgendaService } from './agenda.service';
import { CreateBloqueioDto } from './dto/create-bloqueio.dto';
import { UpdateConfigAgendaDto } from './dto/update-config-agenda.dto';
import { TenantRequest, getTenantId } from '../prisma';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('agenda')
@Controller('agenda')
@ApiBearerAuth()
@Roles('admin', 'gerente', 'operacional', 'motorista')
export class AgendaController {
  constructor(private readonly agendaService: AgendaService) {}

  @Get('mensal/:ano/:mes')
  @ApiOperation({ summary: 'Obter agenda mensal com capacidade diária' })
  getAgendaMensal(
    @Request() req: TenantRequest,
    @Param('ano') ano: number,
    @Param('mes') mes: number,
  ) {
    return this.agendaService.getAgendaMensal(getTenantId(req), ano, mes);
  }

  @Get('semanal/:dataInicio')
  @ApiOperation({ summary: 'Obter agenda semanal' })
  getAgendaSemanal(
    @Request() req: TenantRequest,
    @Param('dataInicio') dataInicio: string,
  ) {
    return this.agendaService.getAgendaSemanal(getTenantId(req), dataInicio);
  }

  @Get('diaria/:data')
  @ApiOperation({ summary: 'Obter agenda diária com mudanças do dia' })
  getAgendaDiaria(
    @Request() req: TenantRequest,
    @Param('data') data: string,
  ) {
    return this.agendaService.getAgendaDiaria(getTenantId(req), data);
  }

  @Get('disponibilidade/:data')
  @ApiOperation({ summary: 'Verificar disponibilidade de uma data' })
  getDisponibilidade(
    @Request() req: TenantRequest,
    @Param('data') data: string,
  ) {
    return this.agendaService.getDisponibilidade(getTenantId(req), data);
  }

  @Get('bloqueios')
  @ApiOperation({ summary: 'Listar bloqueios de agenda' })
  getBloqueios(
    @Request() req: TenantRequest,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ) {
    return this.agendaService.getBloqueios(getTenantId(req), dataInicio, dataFim);
  }

  @Post('bloqueios')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar bloqueio de agenda' })
  criarBloqueio(
    @Request() req: TenantRequest,
    @Body() createBloqueioDto: CreateBloqueioDto,
  ) {
    return this.agendaService.criarBloqueio(getTenantId(req), createBloqueioDto);
  }

  @Delete('bloqueios/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover bloqueio de agenda' })
  removerBloqueio(
    @Request() req: TenantRequest,
    @Param('id') id: string,
  ) {
    return this.agendaService.removerBloqueio(getTenantId(req), id);
  }

  @Get('config')
  @ApiOperation({ summary: 'Obter configuração da agenda' })
  getConfigAgenda(@Request() req: TenantRequest) {
    return this.agendaService.getConfigAgenda(getTenantId(req));
  }

  @Patch('config')
  @ApiOperation({ summary: 'Atualizar configuração da agenda' })
  updateConfigAgenda(
    @Request() req: TenantRequest,
    @Body() updateConfigAgendaDto: UpdateConfigAgendaDto,
  ) {
    return this.agendaService.updateConfigAgenda(getTenantId(req), updateConfigAgendaDto);
  }
}

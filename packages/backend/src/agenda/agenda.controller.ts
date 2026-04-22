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

  @Get('slots/:data')
  @ApiOperation({ summary: 'Obter slots de uma data específica' })
  getSlotsByDate(
    @Request() req: TenantRequest,
    @Param('data') data: string,
  ) {
    return this.agendaService.getSlotsByDate(getTenantId(req), data);
  }

  @Get('slots')
  @ApiOperation({ summary: 'Obter slots de um período' })
  getSlotsByRange(
    @Request() req: TenantRequest,
    @Query('dataInicio') dataInicio: string,
    @Query('dataFim') dataFim: string,
  ) {
    return this.agendaService.getSlotsByRange(getTenantId(req), dataInicio, dataFim);
  }

  @Get('disponibilidade/:data')
  @ApiOperation({ summary: 'Verificar disponibilidade de uma data' })
  getDisponibilidade(
    @Request() req: TenantRequest,
    @Param('data') data: string,
    @Query('horaInicio') horaInicio?: string,
  ) {
    return this.agendaService.getDisponibilidade(getTenantId(req), data, horaInicio);
  }

  @Get('semanal/:dataInicio')
  @ApiOperation({ summary: 'Obter agenda semanal' })
  getAgendaSemanal(
    @Request() req: TenantRequest,
    @Param('dataInicio') dataInicio: string,
  ) {
    return this.agendaService.getAgendaSemanal(getTenantId(req), dataInicio);
  }

  @Get('mensal/:ano/:mes')
  @ApiOperation({ summary: 'Obter agenda mensal' })
  getAgendaMensal(
    @Request() req: TenantRequest,
    @Param('ano') ano: number,
    @Param('mes') mes: number,
  ) {
    return this.agendaService.getAgendaMensal(getTenantId(req), ano, mes);
  }

  @Post('slots/:data')
  @ApiOperation({ summary: 'Criar slots para uma data' })
  criarSlots(
    @Request() req: TenantRequest,
    @Param('data') data: string,
    @Body() slots: any[],
  ) {
    return this.agendaService.criarSlots(getTenantId(req), data, slots);
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

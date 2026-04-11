import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  Request,
  Query,
} from '@nestjs/common';
import { FinanceiroService } from './financeiro.service';
import { CreateMovimentoDto } from './dto/create-movimento.dto';
import { TenantRequest } from '../prisma/prisma.middleware';

@ApiTags('financeiro')
@Controller('financeiro')
@ApiBearerAuth()
export class FinanceiroController {
  constructor(private readonly financeiroService: FinanceiroService) {}

  @Post('movimentos')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar movimento financeiro' })
  createMovimento(
    @Request() req: TenantRequest,
    @Body() createMovimentoDto: CreateMovimentoDto,
  ) {
    return this.financeiroService.createMovimento(req.tenantId, createMovimentoDto);
  }

  @Get('movimentos')
  @ApiOperation({ summary: 'Listar movimentos financeiros' })
  findAllMovimentos(@Request() req: TenantRequest, @Query() filters: any) {
    return this.financeiroService.findAll(req.tenantId, filters);
  }

  @Get('resumo')
  @ApiOperation({ summary: 'Obter resumo financeiro do período' })
  getResumo(
    @Request() req: TenantRequest,
    @Query('dataInicio') dataInicio: string,
    @Query('dataFim') dataFim: string,
  ) {
    return this.financeiroService.getResumo(req.tenantId, dataInicio, dataFim);
  }

  @Get('breakdown/motoristas')
  @ApiOperation({ summary: 'Breakdown financeiro por motorista' })
  getBreakdownMotorista(
    @Request() req: TenantRequest,
    @Query('dataInicio') dataInicio: string,
    @Query('dataFim') dataFim: string,
  ) {
    return this.financeiroService.getBreakdownMotorista(req.tenantId, dataInicio, dataFim);
  }

  @Get('breakdown/tipo-servico')
  @ApiOperation({ summary: 'Breakdown financeiro por tipo de serviço' })
  getBreakdownTipoServico(
    @Request() req: TenantRequest,
    @Query('dataInicio') dataInicio: string,
    @Query('dataFim') dataFim: string,
  ) {
    return this.financeiroService.getBreakdownTipoServico(req.tenantId, dataInicio, dataFim);
  }

  @Get('gastos-detalhados')
  @ApiOperation({ summary: 'Gastos detalhados (combustível e alimentação)' })
  getGastosDetalhados(
    @Request() req: TenantRequest,
    @Query('dataInicio') dataInicio: string,
    @Query('dataFim') dataFim: string,
  ) {
    return this.financeiroService.getGastosDetalhados(req.tenantId, dataInicio, dataFim);
  }

  @Delete('movimentos/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover movimento financeiro' })
  removeMovimento(@Request() req: TenantRequest, @Param('id') id: string) {
    return this.financeiroService.removeMovimento(req.tenantId, id);
  }
}

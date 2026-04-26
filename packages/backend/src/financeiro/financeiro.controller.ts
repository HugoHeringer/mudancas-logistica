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
  Res,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FinanceiroService } from './financeiro.service';
import { CreateMovimentoDto } from './dto/create-movimento.dto';
import { TenantRequest, getTenantId } from '../prisma';
import { Roles } from '../auth/decorators/roles.decorator';
import { ExportService } from '../export/export.service';

@ApiTags('financeiro')
@Controller('financeiro')
@ApiBearerAuth()
@Roles('admin', 'gerente', 'financeiro')
export class FinanceiroController {
  constructor(
    private readonly financeiroService: FinanceiroService,
    private readonly exportService: ExportService,
  ) {}

  @Post('movimentos')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar movimento financeiro' })
  createMovimento(
    @Request() req: TenantRequest,
    @Body() createMovimentoDto: CreateMovimentoDto,
  ) {
    return this.financeiroService.createMovimento(getTenantId(req), createMovimentoDto);
  }

  @Get('movimentos')
  @ApiOperation({ summary: 'Listar movimentos financeiros' })
  findAllMovimentos(@Request() req: TenantRequest, @Query() filters: any) {
    return this.financeiroService.findAll(getTenantId(req), filters);
  }

  @Get('resumo')
  @ApiOperation({ summary: 'Obter resumo financeiro do período' })
  getResumo(
    @Request() req: TenantRequest,
    @Query('dataInicio') dataInicio: string,
    @Query('dataFim') dataFim: string,
  ) {
    return this.financeiroService.getResumo(getTenantId(req), dataInicio, dataFim, req.user);
  }

  @Get('breakdown/motoristas')
  @ApiOperation({ summary: 'Breakdown financeiro por motorista' })
  getBreakdownMotorista(
    @Request() req: TenantRequest,
    @Query('dataInicio') dataInicio: string,
    @Query('dataFim') dataFim: string,
  ) {
    return this.financeiroService.getBreakdownMotorista(getTenantId(req), dataInicio, dataFim, req.user);
  }

  @Get('breakdown/tipo-servico')
  @ApiOperation({ summary: 'Breakdown financeiro por tipo de serviço' })
  getBreakdownTipoServico(
    @Request() req: TenantRequest,
    @Query('dataInicio') dataInicio: string,
    @Query('dataFim') dataFim: string,
  ) {
    return this.financeiroService.getBreakdownTipoServico(getTenantId(req), dataInicio, dataFim, req.user);
  }

  @Get('gastos-detalhados')
  @ApiOperation({ summary: 'Gastos detalhados (combustível e alimentação)' })
  getGastosDetalhados(
    @Request() req: TenantRequest,
    @Query('dataInicio') dataInicio: string,
    @Query('dataFim') dataFim: string,
  ) {
    return this.financeiroService.getGastosDetalhados(getTenantId(req), dataInicio, dataFim, req.user);
  }

  @Get('export')
  @ApiOperation({ summary: 'Exportar movimentos financeiros para Excel/CSV/PDF' })
  async export(
    @Request() req: TenantRequest,
    @Query('dataInicio') dataInicio: string,
    @Query('dataFim') dataFim: string,
    @Query('formato') formato: string,
    @Res() res: any,
  ) {
    const movimentos = await this.financeiroService.findAll(getTenantId(req), { dataInicio, dataFim });

    const colunas = [
      { header: 'Data', key: 'data' },
      { header: 'Tipo', key: 'tipo' },
      { header: 'Categoria', key: 'categoria' },
      { header: 'Descrição', key: 'descricao' },
      { header: 'Valor (€)', key: 'valor' },
      { header: 'Mudança ID', key: 'mudancaId' },
    ];

    const filename = `financeiro_${new Date().toISOString().slice(0, 10)}`;

    if (formato === 'csv') {
      const csv = this.exportService.gerarCsv(movimentos, colunas);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      res.send(csv);
    } else if (formato === 'pdf') {
      const buffer = await this.exportService.gerarPdf(movimentos, colunas, 'Relatório Financeiro');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
      res.send(buffer);
    } else {
      const buffer = this.exportService.gerarExcel(movimentos, colunas, 'Financeiro');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
      res.send(buffer);
    }
  }

  @Delete('movimentos/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover movimento financeiro' })
  removeMovimento(@Request() req: TenantRequest, @Param('id') id: string) {
    return this.financeiroService.removeMovimento(getTenantId(req), id);
  }
}

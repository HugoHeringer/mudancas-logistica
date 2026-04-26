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
  Query,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MudancaService } from './mudanca.service';
import { CreateMudancaDto } from './dto/create-mudanca.dto';
import { UpdateMudancaDto } from './dto/update-mudanca.dto';
import { AprovarMudancaDto } from './dto/aprovar-mudanca.dto';
import { ConcluirMudancaDto } from './dto/concluir-mudanca.dto';
import { TenantRequest, getTenantId } from '../prisma';
import { Roles } from '../auth/decorators/roles.decorator';
import { ExportService } from '../export/export.service';

@ApiTags('mudancas')
@Controller('mudancas')
@ApiBearerAuth()
@Roles('admin', 'gerente', 'operacional', 'motorista')
export class MudancaController {
  constructor(
    private readonly mudancaService: MudancaService,
    private readonly exportService: ExportService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar nova mudança (público ou admin)' })
  create(@Request() req: TenantRequest, @Body() createMudancaDto: CreateMudancaDto) {
    const tenantId = req.user?.tenantId || req.tenantId || createMudancaDto.tenantId;
    return this.mudancaService.create(tenantId!, createMudancaDto);
  }

@Get()
  @ApiOperation({ summary: 'Listar todas as mudancas (com filtros)' })
  findAll(@Request() req: TenantRequest) {
    const filters = req.query as any;
    return this.mudancaService.findAll(getTenantId(req), filters, req.user);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Obter dados para dashboard' })
  getDashboard(@Request() req: TenantRequest) {
    return this.mudancaService.getDashboard(getTenantId(req), req.user?.id);
  }

  @Get('minhas')
  @ApiOperation({ summary: 'Obter mudanças do motorista autenticado' })
  getMinhas(@Request() req: TenantRequest, @Query() filters: any) {
    return this.mudancaService.getMinhas(getTenantId(req), req.user!.id, filters);
  }

  @Get('export')
  @Roles('admin', 'gerente', 'financeiro')
  @ApiOperation({ summary: 'Exportar mudanças para Excel/CSV/PDF' })
  async export(
    @Request() req: TenantRequest,
    @Query() filters: any,
    @Query('formato') formato: string,
    @Res() res: any,
  ) {
    const result = await this.mudancaService.findAll(getTenantId(req), filters, req.user);
    const mudancas = result.items;

    const colunas = [
      { header: 'Cliente', key: 'clienteNome' },
      { header: 'Email', key: 'clienteEmail' },
      { header: 'Telefone', key: 'clienteTelefone' },
      { header: 'Estado', key: 'estado' },
      { header: 'Tipo Serviço', key: 'tipoServico' },
      { header: 'Data Pretendida', key: 'dataPretendida' },
      { header: 'Hora Pretendida', key: 'horaPretendida' },
      { header: 'Equipa', key: 'equipa' },
      { header: 'Motorista', key: 'motorista.nome' },
      { header: 'Receita Prevista', key: 'receitaPrevista' },
      { header: 'Receita Realizada', key: 'receitaRealizada' },
      { header: 'Custos', key: 'custosOperacionais' },
      { header: 'Margem', key: 'margem' },
      { header: 'Criado em', key: 'createdAt' },
    ];

    const filename = `mudancas_${new Date().toISOString().slice(0, 10)}`;

    if (formato === 'csv') {
      const csv = this.exportService.gerarCsv(mudancas, colunas);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      res.send(csv);
    } else if (formato === 'pdf') {
      const buffer = await this.exportService.gerarPdf(mudancas, colunas, 'Relatório de Mudanças');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
      res.send(buffer);
    } else {
      const buffer = this.exportService.gerarExcel(mudancas, colunas, 'Mudanças');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
      res.send(buffer);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter mudança por ID' })
  findOne(@Request() req: TenantRequest, @Param('id') id: string) {
    return this.mudancaService.findOne(getTenantId(req), id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar mudança' })
  update(
    @Request() req: TenantRequest,
    @Param('id') id: string,
    @Body() updateMudancaDto: UpdateMudancaDto,
  ) {
    return this.mudancaService.update(getTenantId(req), id, updateMudancaDto);
  }

  @Post(':id/aprovar')
  @Roles('admin', 'gerente')
  @ApiOperation({ summary: 'Aprovar mudança e atribuir motorista' })
  aprovar(
    @Request() req: TenantRequest,
    @Param('id') id: string,
    @Body() aprovarMudancaDto: AprovarMudancaDto,
  ) {
    return this.mudancaService.aprovar(getTenantId(req), id, aprovarMudancaDto);
  }

  @Post(':id/iniciar')
  @Roles('motorista')
  @ApiOperation({ summary: 'Motorista inicia deslocamento' })
  iniciarDeslocamento(@Request() req: TenantRequest, @Param('id') id: string, @Body() body?: { previsaoChegadaMinutos?: number }) {
    return this.mudancaService.iniciarDeslocamento(getTenantId(req), id, req.user!.id, body?.previsaoChegadaMinutos);
  }

  @Post(':id/em-servico')
  @Roles('motorista')
  @ApiOperation({ summary: 'Motorista inicia serviço no local' })
  emServico(@Request() req: TenantRequest, @Param('id') id: string) {
    return this.mudancaService.emServico(getTenantId(req), id, req.user!.id);
  }

  @Post(':id/concluir')
  @Roles('motorista')
  @ApiOperation({ summary: 'Concluir mudança com ficha' })
  concluir(
    @Request() req: TenantRequest,
    @Param('id') id: string,
    @Body() concluirMudancaDto: ConcluirMudancaDto,
  ) {
    return this.mudancaService.concluir(getTenantId(req), id, concluirMudancaDto);
  }

  @Post(':id/recusar')
  @Roles('admin', 'gerente')
  @ApiOperation({ summary: 'Recusar mudança' })
  recusar(@Request() req: TenantRequest, @Param('id') id: string, @Body() body: { motivo: string }) {
    return this.mudancaService.recusar(getTenantId(req), id, body.motivo);
  }

  @Post(':id/cancelar')
  @Roles('admin', 'gerente')
  @ApiOperation({ summary: 'Cancelar mudança' })
  cancelar(@Request() req: TenantRequest, @Param('id') id: string, @Body() body: { motivo?: string }) {
    return this.mudancaService.cancelar(getTenantId(req), id, body?.motivo);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover mudança' })
  remove(@Request() req: TenantRequest, @Param('id') id: string) {
    return this.mudancaService.remove(getTenantId(req), id);
  }
}

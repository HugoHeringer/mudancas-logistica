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
import { ClienteService } from './cliente.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { TenantRequest, getTenantId } from '../prisma';
import { Roles } from '../auth/decorators/roles.decorator';
import { ExportService } from '../export/export.service';

@ApiTags('clientes')
@Controller('clientes')
@ApiBearerAuth()
@Roles('admin', 'gerente', 'operacional')
export class ClienteController {
  constructor(
    private readonly clienteService: ClienteService,
    private readonly exportService: ExportService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo cliente' })
  create(@Request() req: TenantRequest, @Body() createClienteDto: CreateClienteDto) {
    return this.clienteService.create(getTenantId(req), createClienteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar clientes com filtros' })
  findAll(@Request() req: TenantRequest, @Query() filters: any) {
    return this.clienteService.findAll(getTenantId(req), filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter cliente por ID' })
  findOne(@Request() req: TenantRequest, @Param('id') id: string) {
    return this.clienteService.findOne(getTenantId(req), id);
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Obter cliente por email' })
  findByEmail(@Request() req: TenantRequest, @Param('email') email: string) {
    return this.clienteService.findByEmail(getTenantId(req), email);
  }

  @Get('export')
  @Roles('admin', 'gerente', 'financeiro')
  @ApiOperation({ summary: 'Exportar clientes para Excel/CSV' })
  async export(
    @Request() req: TenantRequest,
    @Query('formato') formato: string,
    @Res() res: any,
  ) {
    const clientes = await this.clienteService.findAll(getTenantId(req), {});

    const colunas = [
      { header: 'Nome', key: 'nome' },
      { header: 'Apelido', key: 'apelido' },
      { header: 'Email', key: 'email' },
      { header: 'Telefone', key: 'telefone' },
      { header: 'NIF', key: 'nif' },
      { header: 'Recorrente', key: 'eRecorrente' },
      { header: 'Notas', key: 'notas' },
    ];

    const filename = `clientes_${new Date().toISOString().slice(0, 10)}`;

    if (formato === 'csv') {
      const csv = this.exportService.gerarCsv(clientes, colunas);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      res.send(csv);
    } else {
      const buffer = this.exportService.gerarExcel(clientes, colunas, 'Clientes');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
      res.send(buffer);
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar cliente' })
  update(
    @Request() req: TenantRequest,
    @Param('id') id: string,
    @Body() updateClienteDto: UpdateClienteDto,
  ) {
    return this.clienteService.update(getTenantId(req), id, updateClienteDto);
  }

  @Post(':sourceId/merge/:targetId')
  @ApiOperation({ summary: 'Mesclar dois clientes (manter target)' })
  merge(
    @Request() req: TenantRequest,
    @Param('sourceId') sourceId: string,
    @Param('targetId') targetId: string,
  ) {
    return this.clienteService.merge(getTenantId(req), sourceId, targetId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover cliente' })
  remove(@Request() req: TenantRequest, @Param('id') id: string) {
    return this.clienteService.remove(getTenantId(req), id);
  }
}

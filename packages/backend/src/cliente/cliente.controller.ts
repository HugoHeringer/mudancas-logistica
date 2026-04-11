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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ClienteService } from './cliente.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { TenantRequest, getTenantId } from '../prisma';

@ApiTags('clientes')
@Controller('clientes')
@ApiBearerAuth()
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}

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

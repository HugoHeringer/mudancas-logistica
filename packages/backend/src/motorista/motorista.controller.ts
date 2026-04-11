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
  Query,
} from '@nestjs/common';
import { MotoristaService } from './motorista.service';
import { CreateMotoristaDto } from './dto/create-motorista.dto';
import { UpdateMotoristaDto } from './dto/update-motorista.dto';
import { TenantRequest } from '../prisma/prisma.middleware';

@ApiTags('motoristas')
@Controller('motoristas')
@ApiBearerAuth()
export class MotoristaController {
  constructor(private readonly motoristaService: MotoristaService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo motorista' })
  create(@Request() req: TenantRequest, @Body() createMotoristaDto: CreateMotoristaDto) {
    return this.motoristaService.create(req.tenantId, createMotoristaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar motoristas com filtros' })
  findAll(@Request() req: TenantRequest, @Query() filters: any) {
    return this.motoristaService.findAll(req.tenantId, filters);
  }

  @Get('disponiveis')
  @ApiOperation({ summary: 'Listar motoristas disponíveis' })
  getDisponiveis(@Request() req: TenantRequest, @Query('data') data?: string) {
    return this.motoristaService.getDisponiveis(req.tenantId, data);
  }

  @Get('me')
  @ApiOperation({ summary: 'Obter dados do motorista autenticado' })
  getMe(@Request() req: TenantRequest) {
    return this.motoristaService.findByUserId(req.tenantId, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter motorista por ID' })
  findOne(@Request() req: TenantRequest, @Param('id') id: string) {
    return this.motoristaService.findOne(req.tenantId, id);
  }

  @Get(':id/performance')
  @ApiOperation({ summary: 'Obter performance do motorista' })
  getPerformance(
    @Request() req: TenantRequest,
    @Param('id') id: string,
    @Query('mes') mes: number,
    @Query('ano') ano: number,
  ) {
    return this.motoristaService.getPerformance(req.tenantId, id, mes, ano);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar motorista' })
  update(
    @Request() req: TenantRequest,
    @Param('id') id: string,
    @Body() updateMotoristaDto: UpdateMotoristaDto,
  ) {
    return this.motoristaService.update(req.tenantId, id, updateMotoristaDto);
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Atualizar estado do motorista' })
  updateEstado(
    @Request() req: TenantRequest,
    @Param('id') id: string,
    @Body() body: { estado: string },
  ) {
    return this.motoristaService.updateEstado(id, body.estado);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover motorista' })
  remove(@Request() req: TenantRequest, @Param('id') id: string) {
    return this.motoristaService.remove(req.tenantId, id);
  }
}

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
import { MotoristaService } from './motorista.service';
import { CreateMotoristaDto } from './dto/create-motorista.dto';
import { UpdateMotoristaDto } from './dto/update-motorista.dto';
import { TenantRequest, getTenantId } from '../prisma';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('motoristas')
@Controller('motoristas')
@ApiBearerAuth()
@Roles('admin', 'gerente', 'operacional')
export class MotoristaController {
  constructor(private readonly motoristaService: MotoristaService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo motorista' })
  create(@Request() req: TenantRequest, @Body() createMotoristaDto: CreateMotoristaDto) {
    return this.motoristaService.create(getTenantId(req), createMotoristaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar motoristas com filtros' })
  findAll(@Request() req: TenantRequest, @Query() filters: any) {
    return this.motoristaService.findAll(getTenantId(req), filters, req.user);
  }

  @Get('disponiveis')
  @ApiOperation({ summary: 'Listar motoristas disponíveis' })
  getDisponiveis(@Request() req: TenantRequest, @Query('data') data?: string) {
    return this.motoristaService.getDisponiveis(getTenantId(req), data);
  }

  @Get('me')
  @ApiOperation({ summary: 'Obter dados do motorista autenticado' })
  getMe(@Request() req: TenantRequest) {
    return this.motoristaService.findByUserId(getTenantId(req), req.user!.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter motorista por ID' })
  findOne(@Request() req: TenantRequest, @Param('id') id: string) {
    return this.motoristaService.findOne(getTenantId(req), id);
  }

  @Get(':id/performance')
  @ApiOperation({ summary: 'Obter performance do motorista' })
  getPerformance(
    @Request() req: TenantRequest,
    @Param('id') id: string,
    @Query('mes') mes: number,
    @Query('ano') ano: number,
  ) {
    return this.motoristaService.getPerformance(getTenantId(req), id, mes, ano);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar motorista' })
  update(
    @Request() req: TenantRequest,
    @Param('id') id: string,
    @Body() updateMotoristaDto: UpdateMotoristaDto,
  ) {
    return this.motoristaService.update(getTenantId(req), id, updateMotoristaDto);
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Atualizar estado do motorista' })
  updateEstado(
    @Request() req: TenantRequest,
    @Param('id') id: string,
    @Body() body: { estado: string },
  ) {
    return this.motoristaService.updateEstado(getTenantId(req), id, body.estado);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover motorista' })
  remove(@Request() req: TenantRequest, @Param('id') id: string) {
    return this.motoristaService.remove(getTenantId(req), id);
  }
}

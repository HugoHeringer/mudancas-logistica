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
import { VeiculoService } from './veiculo.service';
import { CreateVeiculoDto } from './dto/create-veiculo.dto';
import { UpdateVeiculoDto } from './dto/update-veiculo.dto';
import { TenantRequest, getTenantId } from '../prisma';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('veiculos')
@Controller('veiculos')
@ApiBearerAuth()
@Roles('admin', 'gerente', 'operacional')
export class VeiculoController {
  constructor(private readonly veiculoService: VeiculoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo veículo' })
  create(@Request() req: TenantRequest, @Body() createVeiculoDto: CreateVeiculoDto) {
    return this.veiculoService.create(getTenantId(req), createVeiculoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar veículos com filtros' })
  findAll(@Request() req: TenantRequest, @Query() filters: any) {
    return this.veiculoService.findAll(getTenantId(req), filters);
  }

  @Get('disponiveis')
  @ApiOperation({ summary: 'Listar veículos disponíveis' })
  getDisponiveis(
    @Request() req: TenantRequest,
    @Query('paraUrgencias') paraUrgencias?: string,
  ) {
    return this.veiculoService.getDisponiveis(
      getTenantId(req),
      paraUrgencias === 'true',
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter veículo por ID' })
  findOne(@Request() req: TenantRequest, @Param('id') id: string) {
    return this.veiculoService.findOne(getTenantId(req), id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar veículo' })
  update(
    @Request() req: TenantRequest,
    @Param('id') id: string,
    @Body() updateVeiculoDto: UpdateVeiculoDto,
  ) {
    return this.veiculoService.update(getTenantId(req), id, updateVeiculoDto);
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Atualizar estado do veículo' })
  updateEstado(
    @Request() req: TenantRequest,
    @Param('id') id: string,
    @Body() body: { estado: string },
  ) {
    return this.veiculoService.updateEstado(id, body.estado);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover veículo' })
  remove(@Request() req: TenantRequest, @Param('id') id: string) {
    return this.veiculoService.remove(getTenantId(req), id);
  }
}

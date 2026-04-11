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
import { VeiculoService } from './veiculo.service';
import { CreateVeiculoDto } from './dto/create-veiculo.dto';
import { UpdateVeiculoDto } from './dto/update-veiculo.dto';
import { TenantRequest } from '../prisma/prisma.middleware';

@ApiTags('veiculos')
@Controller('veiculos')
@ApiBearerAuth()
export class VeiculoController {
  constructor(private readonly veiculoService: VeiculoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo veículo' })
  create(@Request() req: TenantRequest, @Body() createVeiculoDto: CreateVeiculoDto) {
    return this.veiculoService.create(req.tenantId, createVeiculoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar veículos com filtros' })
  findAll(@Request() req: TenantRequest, @Query() filters: any) {
    return this.veiculoService.findAll(req.tenantId, filters);
  }

  @Get('disponiveis')
  @ApiOperation({ summary: 'Listar veículos disponíveis' })
  getDisponiveis(
    @Request() req: TenantRequest,
    @Query('paraUrgencias') paraUrgencias?: string,
  ) {
    return this.veiculoService.getDisponiveis(
      req.tenantId,
      paraUrgencias === 'true',
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter veículo por ID' })
  findOne(@Request() req: TenantRequest, @Param('id') id: string) {
    return this.veiculoService.findOne(req.tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar veículo' })
  update(
    @Request() req: TenantRequest,
    @Param('id') id: string,
    @Body() updateVeiculoDto: UpdateVeiculoDto,
  ) {
    return this.veiculoService.update(req.tenantId, id, updateVeiculoDto);
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
    return this.veiculoService.remove(req.tenantId, id);
  }
}

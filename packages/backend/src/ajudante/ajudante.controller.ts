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
import { AjudanteService } from './ajudante.service';
import { CreateAjudanteDto } from './dto/create-ajudante.dto';
import { UpdateAjudanteDto } from './dto/update-ajudante.dto';
import { TenantRequest, getTenantId } from '../prisma';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('ajudantes')
@Controller('ajudantes')
@ApiBearerAuth()
@Roles('admin', 'gerente', 'operacional')
export class AjudanteController {
  constructor(private readonly ajudanteService: AjudanteService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo ajudante' })
  create(@Request() req: TenantRequest, @Body() dto: CreateAjudanteDto) {
    return this.ajudanteService.create(getTenantId(req), dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar ajudantes com filtros' })
  findAll(@Request() req: TenantRequest, @Query() filters: any) {
    return this.ajudanteService.findAll(getTenantId(req), filters);
  }

  @Get('disponiveis')
  @ApiOperation({ summary: 'Listar ajudantes disponíveis' })
  findDisponiveis(@Request() req: TenantRequest, @Query('data') data?: string) {
    return this.ajudanteService.findDisponiveis(getTenantId(req), data);
  }

  @Get(':id/performance')
  @ApiOperation({ summary: 'Obter performance do ajudante' })
  getPerformance(
    @Request() req: TenantRequest,
    @Param('id') id: string,
    @Query('mes') mes: number,
    @Query('ano') ano: number,
  ) {
    return this.ajudanteService.getPerformance(getTenantId(req), id, Number(mes), Number(ano));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um ajudante' })
  findOne(@Request() req: TenantRequest, @Param('id') id: string) {
    return this.ajudanteService.findOne(getTenantId(req), id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar ajudante' })
  update(
    @Request() req: TenantRequest,
    @Param('id') id: string,
    @Body() dto: UpdateAjudanteDto,
  ) {
    return this.ajudanteService.update(getTenantId(req), id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover ajudante' })
  remove(@Request() req: TenantRequest, @Param('id') id: string) {
    return this.ajudanteService.remove(getTenantId(req), id);
  }
}

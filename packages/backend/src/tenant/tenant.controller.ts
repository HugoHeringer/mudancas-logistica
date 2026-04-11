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
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@ApiTags('tenants')
@Controller('tenants')
@ApiBearerAuth()
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo tenant' })
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantService.create(createTenantDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os tenants' })
  findAll() {
    return this.tenantService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter tenant por ID' })
  findOne(@Param('id') id: string) {
    return this.tenantService.findOne(id);
  }

  @Get('subdomain/:subdomain')
  @ApiOperation({ summary: 'Obter tenant por subdomínio' })
  findBySubdomain(@Param('subdomain') subdomain: string) {
    return this.tenantService.findBySubdomain(subdomain);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar tenant' })
  update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantService.update(id, updateTenantDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover tenant' })
  remove(@Param('id') id: string) {
    return this.tenantService.remove(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Obter estatísticas do tenant' })
  getStats(@Param('id') id: string) {
    return this.tenantService.getStats(id);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PublicService } from './public.service';
import { CreateMudancaDto } from '../mudanca/dto/create-mudanca.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('public')
@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Public()
  @Post('mudancas')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar nova mudança (público, sem auth)' })
  criarMudanca(@Body() dto: CreateMudancaDto) {
    const tenantId = dto.tenantId;
    if (!tenantId) {
      throw new Error('tenantId é obrigatório');
    }
    return this.publicService.criarMudanca(tenantId, dto);
  }

  @Public()
  @Get('veiculos')
  @ApiOperation({ summary: 'Listar veículos disponíveis (público)' })
  getVeiculos(@Query('tenantId') tenantId: string) {
    return this.publicService.getVeiculos(tenantId);
  }

  @Public()
  @Get('disponibilidade')
  @ApiOperation({ summary: 'Verificar disponibilidade por data (público)' })
  getDisponibilidade(
    @Query('tenantId') tenantId: string,
    @Query('data') data: string,
  ) {
    return this.publicService.getDisponibilidade(tenantId, data);
  }

  @Public()
  @Get('tenant/:subdomain')
  @ApiOperation({ summary: 'Obter info do tenant por subdomain (público)' })
  getTenantInfo(@Param('subdomain') subdomain: string) {
    return this.publicService.getTenantInfo(subdomain);
  }

  @Public()
  @Get('tenant/:subdomain/brand')
  @ApiOperation({ summary: 'Obter marca do tenant por subdomain (público)' })
  getTenantBrand(@Param('subdomain') subdomain: string) {
    return this.publicService.getTenantBrand(subdomain);
  }
}

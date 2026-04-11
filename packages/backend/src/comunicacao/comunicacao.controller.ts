import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  Request,
} from '@nestjs/common';
import { ComunicacaoService } from './comunicacao.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { TenantRequest } from '../prisma/prisma.middleware';

@ApiTags('comunicacao')
@Controller('comunicacao')
@ApiBearerAuth()
export class ComunicacaoController {
  constructor(private readonly comunicacaoService: ComunicacaoService) {}

  @Get('templates')
  @ApiOperation({ summary: 'Listar templates de email' })
  getTemplates(@Request() req: TenantRequest) {
    return this.comunicacaoService.getTemplates(req.tenantId);
  }

  @Get('templates/:nome')
  @ApiOperation({ summary: 'Obter template por nome' })
  getTemplate(@Request() req: TenantRequest, @Param('nome') nome: string) {
    return this.comunicacaoService.getTemplate(req.tenantId, nome);
  }

  @Post('templates')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar template de email' })
  createTemplate(
    @Request() req: TenantRequest,
    @Body() createTemplateDto: CreateTemplateDto,
  ) {
    return this.comunicacaoService.createTemplate(req.tenantId, createTemplateDto);
  }

  @Patch('templates/:nome')
  @ApiOperation({ summary: 'Atualizar template de email' })
  updateTemplate(
    @Request() req: TenantRequest,
    @Param('nome') nome: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ) {
    return this.comunicacaoService.updateTemplate(req.tenantId, nome, updateTemplateDto);
  }

  @Delete('templates/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover template de email' })
  deleteTemplate(@Request() req: TenantRequest, @Param('id') id: string) {
    return this.comunicacaoService.deleteTemplate(req.tenantId, id);
  }

  @Post('templates/:nome/render')
  @ApiOperation({ summary: 'Renderizar template com variáveis' })
  renderTemplate(
    @Request() req: TenantRequest,
    @Param('nome') nome: string,
    @Body() body: { variaveis: Record<string, any> },
  ) {
    return this.comunicacaoService.renderTemplate(req.tenantId, nome, body.variaveis);
  }

  @Post('templates/initialize')
  @ApiOperation({ summary: 'Inicializar templates padrão' })
  initializeTemplates(@Request() req: TenantRequest) {
    return this.comunicacaoService.initializeDefaultTemplates(req.tenantId);
  }
}

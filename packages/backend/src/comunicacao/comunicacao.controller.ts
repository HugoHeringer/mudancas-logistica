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
import { ComunicacaoService } from './comunicacao.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { TenantRequest, getTenantId } from '../prisma';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('comunicacao')
@Controller('comunicacao')
@ApiBearerAuth()
@Roles('admin', 'gerente')
export class ComunicacaoController {
  constructor(private readonly comunicacaoService: ComunicacaoService) {}

  @Get('templates')
  @ApiOperation({ summary: 'Listar templates de email' })
  getTemplates(@Request() req: TenantRequest) {
    return this.comunicacaoService.getTemplates(getTenantId(req));
  }

  @Get('templates/:nome')
  @ApiOperation({ summary: 'Obter template por nome' })
  getTemplate(@Request() req: TenantRequest, @Param('nome') nome: string) {
    return this.comunicacaoService.getTemplate(getTenantId(req), nome);
  }

  @Post('templates')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar template de email' })
  createTemplate(
    @Request() req: TenantRequest,
    @Body() createTemplateDto: CreateTemplateDto,
  ) {
    return this.comunicacaoService.createTemplate(getTenantId(req), createTemplateDto);
  }

  @Patch('templates/:nome')
  @ApiOperation({ summary: 'Atualizar template de email' })
  updateTemplate(
    @Request() req: TenantRequest,
    @Param('nome') nome: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ) {
    return this.comunicacaoService.updateTemplate(getTenantId(req), nome, updateTemplateDto);
  }

  @Delete('templates/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover template de email' })
  deleteTemplate(@Request() req: TenantRequest, @Param('id') id: string) {
    return this.comunicacaoService.deleteTemplate(getTenantId(req), id);
  }

  @Post('templates/:nome/render')
  @ApiOperation({ summary: 'Renderizar template com variáveis' })
  renderTemplate(
    @Request() req: TenantRequest,
    @Param('nome') nome: string,
    @Body() body: { variaveis: Record<string, any> },
  ) {
    return this.comunicacaoService.renderTemplate(getTenantId(req), nome, body.variaveis);
  }

  @Post('templates/initialize')
  @ApiOperation({ summary: 'Inicializar templates padrão' })
  initializeTemplates(@Request() req: TenantRequest) {
    return this.comunicacaoService.initializeDefaultTemplates(getTenantId(req));
  }

  @Get('emails')
  @ApiOperation({ summary: 'Listar histórico de emails enviados' })
  getEmailLogs(
    @Request() req: TenantRequest,
    @Query('mudancaId') mudancaId?: string,
    @Query('destinatario') destinatario?: string,
  ) {
    return this.comunicacaoService.getEmailLogs(getTenantId(req), { mudancaId, destinatario });
  }
}

import {
  Controller, Get, Patch, Param, Query, Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificacaoService } from './notificacao.service';
import { TenantRequest, getTenantId } from '../prisma';

@ApiTags('notificacoes')
@Controller('notificacoes')
@ApiBearerAuth()
export class NotificacaoController {
  constructor(private readonly notificacaoService: NotificacaoService) {}

  @Get()
  @ApiOperation({ summary: 'Listar minhas notificações' })
  findMinhas(
    @Request() req: TenantRequest,
    @Query('naoLidas') naoLidas?: string,
  ) {
    return this.notificacaoService.findMinhas(
      getTenantId(req),
      req.user!.id,
      naoLidas === 'true',
    );
  }

  @Patch(':id/lida')
  @ApiOperation({ summary: 'Marcar notificação como lida' })
  marcarLida(@Request() req: TenantRequest, @Param('id') id: string) {
    return this.notificacaoService.marcarComoLida(getTenantId(req), id, req.user!.id);
  }

  @Patch('marcar-todas-lidas')
  @ApiOperation({ summary: 'Marcar todas as notificações como lidas' })
  marcarTodasLidas(@Request() req: TenantRequest) {
    return this.notificacaoService.marcarTodasComoLidas(getTenantId(req), req.user!.id);
  }
}

import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Param,
  Query,
  Body,
  Request,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { TenantRequest, getTenantId } from '../prisma';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('file')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload de ficheiro (autenticado)' })
  async uploadFile(
    @Request() req: TenantRequest,
    @UploadedFile() file: Express.Multer.File,
    @Query('entidade') entidade?: string,
    @Query('entidadeId') entidadeId?: string,
  ) {
    if (!file) throw new BadRequestException('Nenhum ficheiro enviado');
    return this.uploadService.salvarFicheiro(getTenantId(req), file, entidade, entidadeId);
  }

  @Post('logo')
  @ApiBearerAuth()
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload de logo do tenant (salva URL no configMarca)' })
  async uploadLogo(
    @Request() req: TenantRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Nenhum ficheiro enviado');
    return this.uploadService.salvarLogo(getTenantId(req), file);
  }

  @Post('favicon')
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Gerar favicon automaticamente a partir do logo' })
  async gerarFavicon(@Request() req: TenantRequest) {
    return this.uploadService.gerarFavicon(getTenantId(req));
  }

  @Post('banner')
  @ApiBearerAuth()
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload de banner do site' })
  async uploadBanner(
    @Request() req: TenantRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Nenhum ficheiro enviado');
    return this.uploadService.salvarBanner(getTenantId(req), file);
  }

  @Post('veiculo-imagem')
  @ApiBearerAuth()
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload de imagem do veículo (retorna URL)' })
  async uploadVeiculoImagem(
    @Request() req: TenantRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Nenhum ficheiro enviado');
    return this.uploadService.salvarVeiculoImagem(getTenantId(req), file);
  }

  @Post('material-imagem')
  @ApiBearerAuth()
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload de imagem de material (retorna URL)' })
  async uploadMaterialImagem(
    @Request() req: TenantRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Nenhum ficheiro enviado');
    return this.uploadService.salvarMaterialImagem(getTenantId(req), file);
  }

  @Get('banners')
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Listar banners do tenant' })
  async getBanners(@Request() req: TenantRequest) {
    return this.uploadService.getBannersConfig(getTenantId(req));
  }

  @Patch('banners/reorder')
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Reordenar banners' })
  async reorderBanners(
    @Request() req: TenantRequest,
    @Body() body: { banners: { id: string; ordem: number }[] },
  ) {
    return this.uploadService.reorderBanners(getTenantId(req), body.banners);
  }

  @Patch('banners/:id/toggle')
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Ativar/desativar banner' })
  async toggleBanner(
    @Request() req: TenantRequest,
    @Param('id') id: string,
  ) {
    return this.uploadService.toggleBanner(getTenantId(req), id);
  }

  @Delete('banners/:id')
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Remover banner' })
  async removeBanner(
    @Request() req: TenantRequest,
    @Param('id') id: string,
  ) {
    return this.uploadService.removeBanner(getTenantId(req), id);
  }

  @Post('multiple')
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('files', 10, {
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload multiplos ficheiros (autenticado)' })
  async uploadFiles(
    @Request() req: TenantRequest,
    @UploadedFiles() files: Express.Multer.File[],
    @Query('entidade') entidade?: string,
    @Query('entidadeId') entidadeId?: string,
  ) {
    if (!files?.length) throw new BadRequestException('Nenhum ficheiro enviado');
    const tenantId = getTenantId(req);
    return Promise.all(
      files.map((file) => this.uploadService.salvarFicheiro(tenantId, file, entidade, entidadeId))
    );
  }

  @Public()
  @Post('public')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload de ficheiro (publico, sem auth)' })
  async uploadPublicFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('tenantId') tenantId: string,
    @Query('entidade') entidade?: string,
    @Query('entidadeId') entidadeId?: string,
  ) {
    if (!file) throw new BadRequestException('Nenhum ficheiro enviado');
    if (!tenantId) throw new BadRequestException('tenantId obrigatorio');
    return this.uploadService.salvarFicheiro(tenantId, file, entidade, entidadeId);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar ficheiros' })
  async listarFicheiros(
    @Request() req: TenantRequest,
    @Query('entidade') entidade?: string,
    @Query('entidadeId') entidadeId?: string,
  ) {
    return this.uploadService.listarFicheiros(getTenantId(req), entidade, entidadeId);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar ficheiro' })
  async eliminarFicheiro(
    @Request() req: TenantRequest,
    @Param('id') id: string,
  ) {
    return this.uploadService.eliminarFicheiro(getTenantId(req), id);
  }
}

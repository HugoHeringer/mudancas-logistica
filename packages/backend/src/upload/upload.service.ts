import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  constructor(private prisma: PrismaService) {}

  private ensureUploadDir(tenantId: string, subDir?: string) {
    const uploadDir = subDir
      ? path.join(process.cwd(), 'uploads', tenantId, subDir)
      : path.join(process.cwd(), 'uploads', tenantId);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    return uploadDir;
  }

  private saveFileToDisk(tenantId: string, file: Express.Multer.File, subDir?: string) {
    const uploadDir = this.ensureUploadDir(tenantId, subDir);
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, file.buffer);
    const urlPart = subDir ? `${tenantId}/${subDir}/${fileName}` : `${tenantId}/${fileName}`;
    return { fileName, filePath, url: `/uploads/${urlPart}` };
  }

  async salvarFicheiro(
    tenantId: string,
    file: Express.Multer.File,
    entidade?: string,
    entidadeId?: string,
  ) {
    const { url } = this.saveFileToDisk(tenantId, file);

    const tipo = file.mimetype.startsWith('image/') ? 'imagem' :
                 file.mimetype.startsWith('application/pdf') ? 'documento' : 'outro';

    return this.prisma.ficheiro.create({
      data: {
        tenantId,
        url,
        tipo,
        tamanho: file.size,
        nomeOriginal: file.originalname,
        entidade: entidade || null,
        entidadeId: entidadeId || null,
      },
    });
  }

  async salvarLogo(tenantId: string, file: Express.Multer.File) {
    const { url } = this.saveFileToDisk(tenantId, file, 'logo');

    // Save file record
    const ficheiro = await this.prisma.ficheiro.create({
      data: {
        tenantId,
        url,
        tipo: 'imagem',
        tamanho: file.size,
        nomeOriginal: file.originalname,
        entidade: 'tenant_logo',
        entidadeId: tenantId,
      },
    });

    // Update tenant configMarca with logoUrl
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (tenant) {
      const configMarca = (tenant.configMarca as Record<string, any>) || {};
      configMarca.logoUrl = url;
      await this.prisma.tenant.update({
        where: { id: tenantId },
        data: { configMarca },
      });
    }

    return { ficheiro, logoUrl: url };
  }

  async gerarFavicon(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant nao encontrado');

    const configMarca = (tenant.configMarca as Record<string, any>) || {};
    const logoUrl = configMarca.logoUrl;
    if (!logoUrl) throw new NotFoundException('Logo nao encontrado. Faca upload do logo primeiro.');

    // Use the logo as favicon (browsers accept PNG as favicon)
    const sourcePath = path.join(process.cwd(), logoUrl);
    if (!fs.existsSync(sourcePath)) throw new NotFoundException('Ficheiro do logo nao encontrado no disco');

    const faviconDir = this.ensureUploadDir(tenantId, 'favicon');
    const faviconName = `favicon-${Date.now()}.png`;
    const faviconPath = path.join(faviconDir, faviconName);
    fs.copyFileSync(sourcePath, faviconPath);

    const faviconUrl = `/uploads/${tenantId}/favicon/${faviconName}`;
    configMarca.faviconUrl = faviconUrl;

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { configMarca },
    });

    return { faviconUrl };
  }

  async salvarBanner(tenantId: string, file: Express.Multer.File) {
    const { url } = this.saveFileToDisk(tenantId, file, 'banners');

    // Get current banners count for ordering
    const existingBanners = (await this.getBannersConfig(tenantId)) || [];

    const banner = {
      id: `banner_${Date.now()}`,
      url,
      nomeOriginal: file.originalname,
      ordem: existingBanners.length,
      eAtivo: true,
    };

    existingBanners.push(banner);
    await this.saveBannersConfig(tenantId, existingBanners);

    // Save file record
    await this.prisma.ficheiro.create({
      data: {
        tenantId,
        url,
        tipo: 'imagem',
        tamanho: file.size,
        nomeOriginal: file.originalname,
        entidade: 'banner',
      },
    });

    return banner;
  }

  async getBannersConfig(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant nao encontrado');
    const configMarca = (tenant.configMarca as Record<string, any>) || {};
    return (configMarca.banners || []) as any[];
  }

  async saveBannersConfig(tenantId: string, banners: any[]) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant nao encontrado');
    const configMarca = (tenant.configMarca as Record<string, any>) || {};
    configMarca.banners = banners;
    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { configMarca },
    });
    return banners;
  }

  async reorderBanners(tenantId: string, items: { id: string; ordem: number }[]) {
    const banners = await this.getBannersConfig(tenantId);
    for (const item of items) {
      const banner = banners.find((b: any) => b.id === item.id);
      if (banner) banner.ordem = item.ordem;
    }
    banners.sort((a: any, b: any) => a.ordem - b.ordem);
    return this.saveBannersConfig(tenantId, banners);
  }

  async toggleBanner(tenantId: string, bannerId: string) {
    const banners = await this.getBannersConfig(tenantId);
    const banner = banners.find((b: any) => b.id === bannerId);
    if (!banner) throw new NotFoundException('Banner nao encontrado');
    banner.eAtivo = !banner.eAtivo;
    return this.saveBannersConfig(tenantId, banners);
  }

  async removeBanner(tenantId: string, bannerId: string) {
    const banners = await this.getBannersConfig(tenantId);
    const bannerIndex = banners.findIndex((b: any) => b.id === bannerId);
    if (bannerIndex === -1) throw new NotFoundException('Banner nao encontrado');

    const banner = banners[bannerIndex];

    // Remove file from disk
    const filePath = path.join(process.cwd(), banner.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    banners.splice(bannerIndex, 1);
    // Re-order remaining banners
    banners.forEach((b: any, i: number) => { b.ordem = i; });
    return this.saveBannersConfig(tenantId, banners);
  }

  async listarFicheiros(tenantId: string, entidade?: string, entidadeId?: string) {
    const where: any = { tenantId };
    if (entidade) where.entidade = entidade;
    if (entidadeId) where.entidadeId = entidadeId;
    return this.prisma.ficheiro.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async eliminarFicheiro(tenantId: string, id: string) {
    const ficheiro = await this.prisma.ficheiro.findFirst({ where: { id, tenantId } });
    if (!ficheiro) throw new NotFoundException('Ficheiro nao encontrado');

    // Remove file from disk
    const filePath = path.join(process.cwd(), ficheiro.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return this.prisma.ficheiro.delete({ where: { id } });
  }
}

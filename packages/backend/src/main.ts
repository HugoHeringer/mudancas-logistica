import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // CORS
  const corsOrigins = configService.get<string>('CORS_ORIGIN', '').split(',');
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Mudanças & Logística API')
    .setDescription('API para Sistema de Gestão de Mudanças - SaaS Multi-tenant')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Autenticação')
    .addTag('tenants', 'Gestão de Tenants')
    .addTag('mudancas', 'Gestão de Mudanças')
    .addTag('clientes', 'Gestão de Clientes')
    .addTag('motoristas', 'Gestão de Motoristas')
    .addTag('veiculos', 'Gestão de Veículos')
    .addTag('agenda', 'Gestão de Agenda')
    .addTag('financeiro', 'Gestão Financeira')
    .addTag('comunicacao', 'Comunicação e Emails')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = configService.get<number>('PORT', 3333);
  await app.listen(port);

  console.log(`🚀 API rodando em http://localhost:${port}`);
  console.log(`📚 Documentação em http://localhost:${port}/docs`);
}

bootstrap();

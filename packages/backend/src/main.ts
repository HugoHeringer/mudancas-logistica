import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { DecimalTransformInterceptor } from './prisma/decimal-transform.interceptor';
import * as express from 'express';
import * as path from 'path';
import * as helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['log', 'error', 'warn', 'debug'] });

  const configService = app.get(ConfigService);

  // Security & performance middleware
  app.use(helmet());
  app.use(compression());

  // Global exception filter for debug logging
  app.useGlobalFilters(new AllExceptionsFilter());

  // Transform Prisma Decimal → number in all responses
  app.useGlobalInterceptors(new DecimalTransformInterceptor());

  // Serve uploaded files statically
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

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
    .addTag('notificacoes', 'Notificações In-App')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = configService.get<number>('PORT', 3333);
  await app.listen(port);

  console.log(`🚀 API rodando em http://localhost:${port}`);
  console.log(`📚 Documentação em http://localhost:${port}/docs`);
}

bootstrap();

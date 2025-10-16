import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { BigIntInterceptor } from './common/interceptors/bigint.interceptor';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as os from 'os';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Global BigInt interceptor
  app.useGlobalInterceptors(new BigIntInterceptor());

  // CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    // origin: '*',
    credentials: true,
  });

  // Static file serving for uploads
  // Use different paths for development vs production to avoid EROFS errors on serverless
  const isProduction = process.env.NODE_ENV === 'production';
  const uploadsPath = isProduction 
    ? join('/tmp', 'uploads') 
    : join(__dirname, '..', 'uploads');
  
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
  });

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('E-Learning Backend API')
    .setDescription('Backend API for E-Learning Platform with NestJS')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Get configuration
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3001;

  await app.listen(port, '0.0.0.0');
  
  // Get local network IP address
  const networkInterfaces = os.networkInterfaces();
  const localIP = Object.values(networkInterfaces)
    .flat()
    .find((iface) => iface?.family === 'IPv4' && !iface.internal)?.address;

  console.log(`🚀 Server is running on:`);
  console.log(`   - Local:   http://localhost:${port}`);
  if (localIP) {
    console.log(`   - Network: http://${localIP}:${port}`);
  }
  console.log(`📚 API Documentation:`);
  console.log(`   - Local:   http://localhost:${port}/api`);
  if (localIP) {
    console.log(`   - Network: http://${localIP}:${port}/api`);
  }
}

bootstrap();
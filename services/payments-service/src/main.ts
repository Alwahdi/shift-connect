import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { HttpExceptionFilter, LoggingInterceptor } from '@syndeocare/shared-config';
import { AppModule } from './app.module';

async function bootstrap() {
  // rawBody: true is REQUIRED so Stripe webhook signature verification
  // can access the exact original bytes (req.rawBody).
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? [],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('SyndeoCare Payments Service')
    .setDescription('Payments and Stripe webhook API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

  const port = process.env.PORT ?? 3005;
  await app.listen(port);
  Logger.log(`Payments service running on port ${port}`, 'Bootstrap');
}
bootstrap();

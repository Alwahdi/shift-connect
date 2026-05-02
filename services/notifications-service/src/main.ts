import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { HttpExceptionFilter, LoggingInterceptor } from '@syndeocare/shared-config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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

  // Notifications service has no public REST endpoints (Kafka consumer only),
  // but CORS is restricted as a defence-in-depth measure.
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? [],
    credentials: true,
  });

  const port = process.env.PORT ?? 3004;
  await app.listen(port);
  Logger.log(`Notifications service running on port ${port}`, 'Bootstrap');
}
bootstrap();

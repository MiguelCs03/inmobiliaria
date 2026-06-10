import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Gateway');

  const origins = process.env.ALLOWED_ORIGINS?.split(',') ?? [
    'http://localhost:3000',
    'http://localhost:4200',
  ];
  origins.push('http://localhost:8081');
  origins.push('http://192.168.88.46:8081');

  app.enableCors({
    origin: origins,
    credentials: true,
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  logger.log(`API Gateway running on http://localhost:${port}`);
}
bootstrap();

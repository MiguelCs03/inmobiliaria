import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Gateway');

  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:3000'];
  const isWildcard = allowedOrigins.includes('*');
  app.enableCors({
    origin: isWildcard ? true : allowedOrigins,
    credentials: !isWildcard,
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  logger.log(`API Gateway running on http://localhost:${port}`);
}
bootstrap();

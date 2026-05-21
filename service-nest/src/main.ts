import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

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

  //Agregar filtro global de excepciones
  app.useGlobalFilters(new ValidationExceptionFilter());

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3005',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  app.setGlobalPrefix('api/v1/gestion');

  const config = new DocumentBuilder()
    .setTitle('Microservices API Sistema Gestion')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/gestion/docs', app, document);

  app.enableShutdownHooks();

  const port = process.env.PORT || 3005;
  await app.listen(port);

  logger.log(`Gateway running on http://localhost:${port}/api/v1`);
  logger.log(
    `Documentation available at http://localhost:${port}/api/v1/gestion/docs`,
  );
}
bootstrap();

import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyparser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // PARSER FOR WEBHOOK - Configure raw body parser for webhook signature verification
  app.use('/api/v1/newsletter/webhook', (req, res, next) => {
    bodyparser.json({
      verify: (req: any, res, buf) => {
        req.rawBody = buf.toString('utf8');
      },
    })(req, res, next);
  });

  //PARSER FOR WEBHOOK
  app.use(bodyparser.urlencoded({ extended: true }));
  app.use(bodyparser.json());

  // GLOBAL VALIDATION
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // ENABLE CORS
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? [
            'https://artistepilot.com',
            'https://www.artistepilot.com',
            'http://localhost:3000',
          ]
        : true,
    credentials: true,
  });

  // GLOBAL SERIALIZATION INTERCEPTOR
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // SWAGGER DOCUMENTATION
  const config = new DocumentBuilder()
    .setTitle('ArtistePilot')
    .setDescription('API Endpoints')
    .setTermsOfService('terms-of-service')
    .addServer('http://localhost:4000')
    .addServer('https://artistepilot.onrender.com')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 4000);

  console.log(`Server is running on port: ${process.env.PORT ?? 4000}`);
}
bootstrap();

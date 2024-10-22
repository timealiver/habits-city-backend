import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOptions: CorsOptions = {
    origin: [
      'http://localhost:3000',
      'https://habits-city-frontend.vercel.app',
      'https://molsrg-habits-city-frontend-ab3a.twc1.net',
    ],
    credentials: true,
  };
  app.enableCors(corsOptions);

  await app.listen(process.env.PORT ?? 5001);
}
bootstrap();

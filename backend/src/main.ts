
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Fix BigInt JSON serialization for Prisma responses
  app.getHttpAdapter()
    .getInstance()
    .set('json replacer', (_key: string, value: unknown) => {
      return typeof value === 'bigint' ? value.toString() : value;
    });

  app.setGlobalPrefix('api');
  app.enableCors();

  const port = Number(process.env.PORT || 3001);
  await app.listen(port, '0.0.0.0');

  console.log(`Mela Note API listening on port ${port}`);
}

bootstrap();

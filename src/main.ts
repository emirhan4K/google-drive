import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, //Sadece dto olanlara izin verir
    forbidNonWhitelisted: true, //Dto olmayan veri gelirse anında hata fırlatır.
    transform: true, //Gelen verinin tipini otomatik çevirir
  }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

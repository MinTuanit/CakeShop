import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('CakeWeb API')
    .setDescription('API documentation for CakeWeb backend')
    .setVersion('1.0')
    .addTag('products', 'Quan ly san pham banh kem')
    .addTag('auth', 'Dang ky, dang nhap va token')
    .addTag('users', 'Quan ly nguoi dung')
    .addCookieAuth(
      'access_token',
      {
        type: 'apiKey',
        in: 'cookie',
        name: 'access_token',
      },
      'access_token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}

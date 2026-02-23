import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/api/app.module';

async function main() {
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] });
  await app.init();
  await app.close();
  console.log('Bootstrap check passed');
  process.exit(0);
}

main().catch((err) => {
  console.error('Bootstrap check FAILED:', err.message);
  process.exit(1);
});

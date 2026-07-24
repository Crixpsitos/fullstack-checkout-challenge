import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs('database', (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT!, 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  autoLoadEntities: true,

  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',

  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,

  extra: {
    max: 20,
    idleTimeoutMillis: 30000,
  },
}));

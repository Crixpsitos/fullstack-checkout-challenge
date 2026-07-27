import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';

type SslConfig = false | { rejectUnauthorized: boolean; ca?: string };

const buildSsl = (): SslConfig => {
  if (process.env.DB_SSL !== 'true') return false;

  const certPath = path.join(process.cwd(), 'globa-rds.pem');
  if (fs.existsSync(certPath)) {
    return {
      rejectUnauthorized: false,
      ca: fs.readFileSync(certPath).toString(),
    };
  }

  return { rejectUnauthorized: false };
};

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

  ssl: buildSsl(),

  extra: {
    max: 20,
    idleTimeoutMillis: 30000,
  },
}));

import 'reflect-metadata';
import { DataSource } from 'typeorm';

/**
 * TypeORM DataSource for migration CLI.
 * Used by: npx typeorm migration:generate / migration:run / migration:revert
 *
 * Usage:
 *   DATABASE_URL=postgres://... npx typeorm -d src/data-source.ts migration:run
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL ?? 'postgres://syndeocare:password@localhost:5432/payments_db',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false, // never true in production — use migrations
  logging: process.env.NODE_ENV === 'development',
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
});

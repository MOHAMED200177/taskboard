import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from '../users/user.entity';
import { Project } from '../projects/project.entity';
import { Task } from '../tasks/task.entity';
import { RefreshToken } from '../auth/refresh-token.entity';

// Used ONLY by the TypeORM CLI (migration:generate / migration:run / migration:revert).
// The running app still uses the async config in app.module.ts.
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT ?? 5432),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  ssl:
    process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities: [User, Project, Task, RefreshToken],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});

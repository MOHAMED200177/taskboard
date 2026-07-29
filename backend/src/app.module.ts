import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',

        host: configService.get<string>('DATABASE_HOST'),
        port: Number(configService.get<number>('DATABASE_PORT', 5432)),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),

        // SSL is required for hosted Postgres (e.g. Neon) but must be OFF
        // for local/Docker Postgres. Controlled via DATABASE_SSL env var.
        ssl:
          configService.get('DATABASE_SSL') === 'true'
            ? { rejectUnauthorized: false }
            : false,

        autoLoadEntities: true,
        synchronize: configService.get('NODE_ENV') !== 'production',

        migrations: ['dist/database/migrations/*.js'],
        migrationsRun: configService.get('NODE_ENV') === 'production',
      }),
    }),

    AuthModule,
    ProjectsModule,
    TasksModule,
  ],
})
export class AppModule {}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1706500000000 implements MigrationInterface {
  name = 'InitSchema1706500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(
      `CREATE TYPE "users_role_enum" AS ENUM ('admin', 'member')`,
    );
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL,
        "email" varchar NOT NULL,
        "password" varchar NOT NULL,
        "role" "users_role_enum" NOT NULL DEFAULT 'member',
        "loginAttempts" integer NOT NULL DEFAULT 0,
        "lockedUntil" TIMESTAMP,
        "resetPasswordToken" varchar,
        "resetPasswordExpiry" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "projects" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL,
        "description" varchar,
        "created_by" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_projects_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_projects_created_by" FOREIGN KEY ("created_by")
          REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "project_members" (
        "project_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        CONSTRAINT "PK_project_members" PRIMARY KEY ("project_id", "user_id"),
        CONSTRAINT "FK_project_members_project" FOREIGN KEY ("project_id")
          REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_project_members_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    await queryRunner.query(
      `CREATE TYPE "tasks_status_enum" AS ENUM ('todo', 'in_progress', 'done')`,
    );
    await queryRunner.query(
      `CREATE TYPE "tasks_priority_enum" AS ENUM ('low', 'medium', 'high')`,
    );
    await queryRunner.query(`
      CREATE TABLE "tasks" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "title" varchar NOT NULL,
        "description" varchar,
        "status" "tasks_status_enum" NOT NULL DEFAULT 'todo',
        "priority" "tasks_priority_enum" NOT NULL DEFAULT 'medium',
        "dueDate" TIMESTAMP,
        "project_id" uuid NOT NULL,
        "creator_id" uuid NOT NULL,
        "assignee_id" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tasks_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_tasks_project" FOREIGN KEY ("project_id")
          REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_tasks_creator" FOREIGN KEY ("creator_id")
          REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_tasks_assignee" FOREIGN KEY ("assignee_id")
          REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "token" varchar NOT NULL,
        "userId" uuid NOT NULL,
        "deviceInfo" varchar,
        "isRevoked" boolean NOT NULL DEFAULT false,
        "expiresAt" TIMESTAMP NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_refresh_tokens_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_refresh_tokens_user" FOREIGN KEY ("userId")
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE "tasks"`);
    await queryRunner.query(`DROP TYPE "tasks_priority_enum"`);
    await queryRunner.query(`DROP TYPE "tasks_status_enum"`);
    await queryRunner.query(`DROP TABLE "project_members"`);
    await queryRunner.query(`DROP TABLE "projects"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "users_role_enum"`);
  }
}

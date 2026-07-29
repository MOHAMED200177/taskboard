import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { AppModule } from '../app.module';
import { User, UserRole } from '../users/user.entity';
import { Project } from '../projects/project.entity';
import { Task, TaskStatus, TaskPriority } from '../tasks/task.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));
  const projectRepo = app.get<Repository<Project>>(getRepositoryToken(Project));
  const taskRepo = app.get<Repository<Task>>(getRepositoryToken(Task));

  console.log('Seeding database...');

  // ---- Users ----
  let admin = await userRepo.findOne({ where: { email: 'admin@test.com' } });
  if (!admin) {
    admin = userRepo.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: await bcrypt.hash('Admin1234', 12),
      role: UserRole.ADMIN,
    });
    admin = await userRepo.save(admin);
    console.log('✔ Created admin@test.com / Admin1234');
  } else {
    console.log('- Admin already exists, skipping');
  }

  let member = await userRepo.findOne({ where: { email: 'member@test.com' } });
  if (!member) {
    member = userRepo.create({
      name: 'Member User',
      email: 'member@test.com',
      password: await bcrypt.hash('Member1234', 12),
      role: UserRole.MEMBER,
    });
    member = await userRepo.save(member);
    console.log('✔ Created member@test.com / Member1234');
  } else {
    console.log('- Member already exists, skipping');
  }

  // ---- Project ----
  let project = await projectRepo.findOne({
    where: { name: 'Demo Project' },
    relations: {
      members: true,
      createdBy: true,
    },
  });
  if (!project) {
    project = projectRepo.create({
      name: 'Demo Project',
      description: 'Seeded demo project for reviewers',
      createdBy: admin,
      members: [admin, member],
    });
    project = await projectRepo.save(project);
    console.log('✔ Created "Demo Project"');
  } else {
    console.log('- Demo Project already exists, skipping');
  }

  // ---- Tasks ----
  const existingTasksCount = await taskRepo.count({
    where: { project: { id: project.id } },
  });
  if (existingTasksCount === 0) {
    const demoTasks = [
      {
        title: 'Set up repo',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        assignee: admin,
      },
      {
        title: 'Design DB schema',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        assignee: member,
      },
      {
        title: 'Build frontend',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        assignee: member,
      },
    ];

    for (const t of demoTasks) {
      const task = taskRepo.create({ ...t, project, creator: admin });
      await taskRepo.save(task);
    }
    console.log(`✔ Created ${demoTasks.length} demo tasks`);
  } else {
    console.log('- Tasks already exist, skipping');
  }

  console.log('Seeding done.');
  await app.close();
}

bootstrap().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});

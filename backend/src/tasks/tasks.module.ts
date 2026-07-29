import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './task.entity';
import { User } from '../users/user.entity';
import { Project } from '../projects/project.entity';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [TypeOrmModule.forFeature([Task, User, Project]), ProjectsModule],
  providers: [TasksService],
  controllers: [TasksController],
})
export class TasksModule {}

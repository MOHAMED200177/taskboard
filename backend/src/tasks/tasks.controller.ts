import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FilterTaskDto } from './dto/filter-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  create(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: CreateTaskDto,
    @CurrentUser() user: User,
  ) {
    return this.tasksService.create(projectId, dto, user);
  }

  @Get()
  findAll(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query() filters: FilterTaskDto,
    @CurrentUser() user: User,
  ) {
    return this.tasksService.findAll(projectId, filters, user);
  }

  @Get(':taskId')
  findOne(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @CurrentUser() user: User,
  ) {
    return this.tasksService.findOne(projectId, taskId, user);
  }

  @Patch(':taskId')
  update(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: User,
  ) {
    return this.tasksService.update(projectId, taskId, dto, user);
  }

  @Delete(':taskId')
  remove(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @CurrentUser() user: User,
  ) {
    return this.tasksService.remove(projectId, taskId, user);
  }
}

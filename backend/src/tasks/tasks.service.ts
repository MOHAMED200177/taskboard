import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { User } from '../users/user.entity';
import { Project } from '../projects/project.entity';
import { ProjectsService } from '../projects/projects.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FilterTaskDto } from './dto/filter-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    private projectsService: ProjectsService,
  ) {}

  // ==================== CREATE ====================
  async create(
    projectId: string,
    dto: CreateTaskDto,
    currentUser: User,
  ): Promise<Task> {
    const project = await this.projectsService.findOne(projectId, currentUser);

    let assignee: User | undefined = undefined;
    if (dto.assigneeId) {
      const isMember = project.members.some((m) => m.id === dto.assigneeId);
      if (!isMember)
        throw new ForbiddenException(
          'Assignee must be a member of the project',
        );
      assignee =
        (await this.userRepo.findOne({ where: { id: dto.assigneeId } })) ??
        undefined;
    }

    const task = this.taskRepo.create({
      title: dto.title,
      description: dto.description,
      status: dto.status,
      priority: dto.priority,
      dueDate: dto.dueDate,
      project,
      creator: currentUser,
      assignee: assignee,
    });

    return this.taskRepo.save(task);
  }

  // ==================== FIND ALL (with filters) ====================
  // ==================== FIND ALL (with filters, search, sort, pagination) ====================
  async findAll(
    projectId: string,
    filters: FilterTaskDto,
    currentUser: User,
  ): Promise<{
    data: Task[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    await this.projectsService.findOne(projectId, currentUser);

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const sortBy = filters.sortBy ?? 'createdAt';
    const sortOrder = filters.sortOrder ?? 'DESC';

    const query = this.taskRepo
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.creator', 'creator')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .where('task.project_id = :projectId', { projectId });

    if (filters.status) {
      query.andWhere('task.status = :status', { status: filters.status });
    }
    if (filters.priority) {
      query.andWhere('task.priority = :priority', {
        priority: filters.priority,
      });
    }
    if (filters.assigneeId) {
      query.andWhere('assignee.id = :assigneeId', {
        assigneeId: filters.assigneeId,
      });
    }
    if (filters.search) {
      query.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    query
      .orderBy(`task.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
  // ==================== FIND ONE ====================
  async findOne(
    projectId: string,
    taskId: string,
    currentUser: User,
  ): Promise<Task> {
    await this.projectsService.findOne(projectId, currentUser);

    const task = await this.taskRepo.findOne({
      where: { id: taskId, project: { id: projectId } },
      relations: {
        creator: true,
        assignee: true,
        project: true,
      },
    });

    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  // ==================== UPDATE ====================
  async update(
    projectId: string,
    taskId: string,
    dto: UpdateTaskDto,
    currentUser: User,
  ): Promise<Task> {
    const project = await this.projectsService.findOne(projectId, currentUser);
    const task = await this.findOne(projectId, taskId, currentUser);

    const isAdmin = this.projectsService.isAdmin(project, currentUser);
    const isCreator = task.creator.id === currentUser.id;
    const isAssignee = task.assignee?.id === currentUser.id;

    if (!isAdmin && !isCreator && !isAssignee) {
      throw new ForbiddenException('You cannot modify this task');
    }

    if (dto.assigneeId !== undefined) {
      if (dto.assigneeId === null) {
        task.assignee = null;
      } else {
        const isMember = project.members.some((m) => m.id === dto.assigneeId);
        if (!isMember) {
          throw new ForbiddenException(
            'Assignee must be a member of the project',
          );
        }
        task.assignee = await this.userRepo.findOne({
          where: { id: dto.assigneeId },
        });
      }
    }

    Object.assign(task, {
      title: dto.title ?? task.title,
      description: dto.description ?? task.description,
      status: dto.status ?? task.status,
      priority: dto.priority ?? task.priority,
      dueDate: dto.dueDate ?? task.dueDate,
    });

    return this.taskRepo.save(task);
  }

  // ==================== DELETE ====================
  async remove(
    projectId: string,
    taskId: string,
    currentUser: User,
  ): Promise<void> {
    const project = await this.projectsService.findOne(projectId, currentUser);
    const task = await this.findOne(projectId, taskId, currentUser);

    const isAdmin = this.projectsService.isAdmin(project, currentUser);
    const isCreator = task.creator.id === currentUser.id;

    if (!isAdmin && !isCreator) {
      throw new ForbiddenException('You cannot delete this task');
    }

    await this.taskRepo.remove(task);
  }
}

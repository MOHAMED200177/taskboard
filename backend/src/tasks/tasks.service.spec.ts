import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ProjectsService } from '../projects/projects.service';
import { Task, TaskStatus } from './task.entity';
import { User, UserRole } from '../users/user.entity';
import { Project } from '../projects/project.entity';

const mockTaskRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(),
});

const mockUserRepo = () => ({
  findOne: jest.fn(),
});

const mockProjectRepo = () => ({});

const mockProjectsService = () => ({
  findOne: jest.fn(),
  isAdmin: jest.fn(),
});

const makeUser = (id: string): User =>
  ({
    id,
    name: 'User',
    email: `${id}@test.com`,
    role: UserRole.MEMBER,
  }) as User;

describe('TasksService', () => {
  let service: TasksService;
  let taskRepo: ReturnType<typeof mockTaskRepo>;
  let projectsService: ReturnType<typeof mockProjectsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(Task), useFactory: mockTaskRepo },
        { provide: getRepositoryToken(User), useFactory: mockUserRepo },
        { provide: getRepositoryToken(Project), useFactory: mockProjectRepo },
        { provide: ProjectsService, useFactory: mockProjectsService },
      ],
    }).compile();

    service = module.get(TasksService);
    taskRepo = module.get(getRepositoryToken(Task));
    projectsService = module.get(ProjectsService);
  });

  // TEST 1 — Cannot assign a task to a non-member
  describe('create', () => {
    it('should throw ForbiddenException if assignee is not a project member', async () => {
      const owner = makeUser('owner-id');
      const stranger = makeUser('stranger-id');

      const project: Partial<Project> = { id: 'proj-1', members: [owner] };
      projectsService.findOne.mockResolvedValue(project);

      await expect(
        service.create(
          'proj-1',
          { title: 'Task', assigneeId: stranger.id } as any,
          owner,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    // TEST 2 — Only admin/creator/assignee can update
    it('should throw ForbiddenException if user is not admin, creator, or assignee', async () => {
      const owner = makeUser('owner-id');
      const creator = makeUser('creator-id');
      const stranger = makeUser('stranger-id');

      const project: Partial<Project> = {
        id: 'proj-1',
        createdBy: owner,
        members: [owner, creator, stranger],
      };
      const task: Partial<Task> = { id: 'task-1', creator, assignee: null };

      projectsService.findOne.mockResolvedValue(project);
      projectsService.isAdmin.mockReturnValue(false);
      taskRepo.findOne.mockResolvedValue(task);

      await expect(
        service.update('proj-1', 'task-1', { title: 'New' } as any, stranger),
      ).rejects.toThrow(ForbiddenException);
    });

    // TEST 3 — assigneeId: null clears the assignee
    it('should allow clearing the assignee when assigneeId is null', async () => {
      const owner = makeUser('owner-id');
      const assignee = makeUser('assignee-id');

      const project: Partial<Project> = {
        id: 'proj-1',
        createdBy: owner,
        members: [owner, assignee],
      };
      const task: Partial<Task> = {
        id: 'task-1',
        creator: owner,
        assignee,
        title: 'Task',
      };

      projectsService.findOne.mockResolvedValue(project);
      projectsService.isAdmin.mockReturnValue(true);
      taskRepo.findOne.mockResolvedValue(task);
      taskRepo.save.mockImplementation((t) => Promise.resolve(t));

      const result = await service.update(
        'proj-1',
        'task-1',
        { assigneeId: null } as any,
        owner,
      );

      expect(result.assignee).toBeNull();
    });
  });

  // TEST 4 — Only admin/creator can delete
  describe('remove', () => {
    it('should throw ForbiddenException if user is not admin or creator', async () => {
      const owner = makeUser('owner-id');
      const creator = makeUser('creator-id');
      const stranger = makeUser('stranger-id');

      const project: Partial<Project> = {
        id: 'proj-1',
        createdBy: owner,
        members: [owner, creator, stranger],
      };
      const task: Partial<Task> = { id: 'task-1', creator };

      projectsService.findOne.mockResolvedValue(project);
      projectsService.isAdmin.mockReturnValue(false);
      taskRepo.findOne.mockResolvedValue(task);

      await expect(
        service.remove('proj-1', 'task-1', stranger),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // TEST 5 — Filtering by status
  describe('findAll', () => {
    it('should filter tasks by status', async () => {
      const owner = makeUser('owner-id');
      const project: Partial<Project> = { id: 'proj-1', members: [owner] };
      projectsService.findOne.mockResolvedValue(project);

      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      taskRepo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll(
        'proj-1',
        { status: TaskStatus.DONE } as any,
        owner,
      );

      expect(qb.andWhere).toHaveBeenCalledWith('task.status = :status', {
        status: TaskStatus.DONE,
      });
    });
  });
});

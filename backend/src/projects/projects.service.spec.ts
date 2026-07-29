import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { User, UserRole } from '../users/user.entity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

const mockProjectRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(),
});

const mockUserRepo = () => ({
  findOne: jest.fn(),
});

const makeUser = (id: string): User =>
  ({
    id,
    name: 'User',
    email: `${id}@test.com`,
    role: UserRole.MEMBER,
  }) as User;

describe('ProjectsService', () => {
  let service: ProjectsService;
  let projectRepo: ReturnType<typeof mockProjectRepo>;
  let userRepo: ReturnType<typeof mockUserRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: getRepositoryToken(Project), useFactory: mockProjectRepo },
        { provide: getRepositoryToken(User), useFactory: mockUserRepo },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    projectRepo = module.get(getRepositoryToken(Project));
    userRepo = module.get(getRepositoryToken(User));
  });

  // TEST 3 — Only project admin can update
  describe('update', () => {
    it('should throw ForbiddenException if non-admin tries to update', async () => {
      const owner = makeUser('owner-id');
      const otherUser = makeUser('other-id');

      const project: Partial<Project> = {
        id: 'proj-1',
        name: 'Test Project',
        createdBy: owner,
        members: [owner, otherUser],
      };

      // Mock findOne via queryBuilder
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(project),
      };
      projectRepo.createQueryBuilder.mockReturnValue(qb);

      await expect(
        service.update('proj-1', { name: 'New Name' }, otherUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // TEST 4 — Cannot remove project creator from members
  describe('removeMember', () => {
    it('should throw ForbiddenException when trying to remove the creator', async () => {
      const owner = makeUser('owner-id');
      const member = makeUser('member-id');

      const project: Partial<Project> = {
        id: 'proj-1',
        createdBy: owner,
        members: [owner, member],
      };

      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(project),
      };
      projectRepo.createQueryBuilder.mockReturnValue(qb);

      await expect(
        service.removeMember('proj-1', 'owner-id', owner),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // TEST 5 — Non-member cannot access project
  describe('findOne', () => {
    it('should throw ForbiddenException if user is not a member', async () => {
      const owner = makeUser('owner-id');
      const stranger = makeUser('stranger-id');

      const project: Partial<Project> = {
        id: 'proj-1',
        createdBy: owner,
        members: [owner],
      };

      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(project),
      };
      projectRepo.createQueryBuilder.mockReturnValue(qb);

      await expect(service.findOne('proj-1', stranger)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { User } from '../users/user.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddMemberDto } from './dto/add-member.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  // ==================== CREATE ====================
  async create(dto: CreateProjectDto, currentUser: User): Promise<Project> {
    const project = this.projectRepo.create({
      name: dto.name,
      description: dto.description,
      createdBy: currentUser,
      members: [currentUser],
    });
    return this.projectRepo.save(project);
  }

  // ==================== FIND ALL (mine only) ====================
  async findAll(currentUser: User): Promise<Project[]> {
    return this.projectRepo
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.createdBy', 'creator')
      .leftJoinAndSelect('project.members', 'members')
      .where('members.id = :userId', { userId: currentUser.id })
      .orderBy('project.createdAt', 'DESC')
      .getMany();
  }

  // ==================== FIND ONE ====================
  async findOne(id: string, currentUser: User): Promise<Project> {
    const project = await this.projectRepo
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.createdBy', 'creator')
      .leftJoinAndSelect('project.members', 'members')
      .where('project.id = :id', { id })
      .getOne();

    if (!project) throw new NotFoundException('Project not found');
    this.checkMembership(project, currentUser);
    return project;
  }

  // ==================== UPDATE ====================
  async update(
    id: string,
    dto: UpdateProjectDto,
    currentUser: User,
  ): Promise<Project> {
    const project = await this.findOne(id, currentUser);
    this.checkAdmin(project, currentUser);

    Object.assign(project, dto);
    return this.projectRepo.save(project);
  }

  // ==================== DELETE ====================
  async remove(id: string, currentUser: User): Promise<void> {
    const project = await this.findOne(id, currentUser);
    this.checkAdmin(project, currentUser);
    await this.projectRepo.remove(project);
  }

  // ==================== ADD MEMBER ====================
  async addMember(
    id: string,
    dto: AddMemberDto,
    currentUser: User,
  ): Promise<Project> {
    const project = await this.findOne(id, currentUser);
    this.checkAdmin(project, currentUser);

    const userToAdd = await this.userRepo.findOne({
      where: { id: dto.userId },
    });
    if (!userToAdd) throw new NotFoundException('User not found');

    const alreadyMember = project.members.some((m) => m.id === dto.userId);
    if (alreadyMember) throw new ConflictException('User is already a member');

    project.members.push(userToAdd);
    return this.projectRepo.save(project);
  }

  // ==================== REMOVE MEMBER ====================
  async removeMember(
    id: string,
    userId: string,
    currentUser: User,
  ): Promise<Project> {
    const project = await this.findOne(id, currentUser);
    this.checkAdmin(project, currentUser);

    if (userId === project.createdBy.id) {
      throw new ForbiddenException('Cannot remove the project creator');
    }

    project.members = project.members.filter((m) => m.id !== userId);
    return this.projectRepo.save(project);
  }

  // ==================== HELPERS ====================
  private checkMembership(project: Project, user: User): void {
    const isMember = project.members.some((m) => m.id === user.id);
    if (!isMember)
      throw new ForbiddenException('You are not a member of this project');
  }

  isAdmin(project: Project, user: User): boolean {
    return project.createdBy.id === user.id;
  }

  private checkAdmin(project: Project, user: User): void {
    if (!this.isAdmin(project, user)) {
      throw new ForbiddenException(
        'Only the project admin can perform this action',
      );
    }
  }
}

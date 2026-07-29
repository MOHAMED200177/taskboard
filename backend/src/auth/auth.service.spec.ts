import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from '../users/user.entity';
import { RefreshToken } from './refresh-token.entity';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

const mockUserRepo = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

const mockRefreshTokenRepo = () => ({
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn().mockReturnValue('mock_token'),
});

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: ReturnType<typeof mockUserRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useFactory: mockUserRepo },
        { provide: getRepositoryToken(RefreshToken), useFactory: mockRefreshTokenRepo },
        { provide: JwtService, useFactory: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepo = module.get(getRepositoryToken(User));
  });

  // TEST 1 — Register: conflict on duplicate email
  describe('register', () => {
    it('should throw ConflictException if email already exists', async () => {
      userRepo.findOne.mockResolvedValue({ id: '1', email: 'test@test.com' });

      await expect(
        service.register({ email: 'test@test.com', password: 'Password1', name: 'Test' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should register successfully with a new email', async () => {
      userRepo.findOne.mockResolvedValue(null);
      userRepo.create.mockReturnValue({ email: 'new@test.com' });
      userRepo.save.mockResolvedValue({ id: '1', email: 'new@test.com' });

      const result = await service.register({
        email: 'new@test.com',
        password: 'Password1',
        name: 'New User',
      });

      expect(result).toEqual({ message: 'Registered successfully. Please login.' });
    });
  });

  // TEST 2 — Login: invalid credentials
  describe('login', () => {
    it('should throw UnauthorizedException for wrong password', async () => {
      const hashedPassword = await bcrypt.hash('CorrectPass1', 12);
      userRepo.findOne.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        password: hashedPassword,
        loginAttempts: 0,
        lockedUntil: null,
      });
      userRepo.save.mockResolvedValue({});

      const mockRes = { cookie: jest.fn() } as any;

      await expect(
        service.login({ email: 'test@test.com', password: 'WrongPass1' }, mockRes),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if account is locked', async () => {
      userRepo.findOne.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        password: 'hashed',
        loginAttempts: 0,
        lockedUntil: new Date(Date.now() + 60000), // locked for 1 more minute
      });

      const mockRes = { cookie: jest.fn() } as any;

      await expect(
        service.login({ email: 'test@test.com', password: 'anything' }, mockRes),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
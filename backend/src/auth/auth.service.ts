import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/user.entity';
import { RefreshToken } from './refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepo: Repository<RefreshToken>,
    private jwt: JwtService,
  ) {}

  // ==================== TOKENS ====================

  private generateAccessToken(user: User) {
    return this.jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' },
    );
  }

  private generateRefreshToken(userId: string) {
    return this.jwt.sign(
      { sub: userId },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
    );
  }

  private setRefreshTokenCookie(res: Response, token: string) {
    res.cookie('refresh_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private async saveRefreshToken(
    userId: string,
    token: string,
    deviceInfo?: string,
  ) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    if (deviceInfo) {
      await this.refreshTokenRepo.update(
        { userId, deviceInfo, isRevoked: false },
        { isRevoked: true },
      );
    }
    const hashed = await bcrypt.hash(token, 10);
    const refreshToken = this.refreshTokenRepo.create({
      userId,
      token: hashed,
      expiresAt,
      deviceInfo,
    });
    return this.refreshTokenRepo.save(refreshToken);
  }

  // ==================== REGISTER ====================

  async register(dto: RegisterDto) {
    const exists = await this.userRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(dto.password, 12);
    const user = this.userRepo.create({ ...dto, password: hashed });
    await this.userRepo.save(user);

    return { message: 'Registered successfully. Please login.' };
  }

  // ==================== LOGIN ====================

  async login(dto: LoginDto, res: Response, deviceInfo?: string) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000,
      );
      throw new UnauthorizedException(
        `Account locked. Try again in ${minutesLeft} minutes.`,
      );
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
        user.loginAttempts = 0;
        await this.userRepo.save(user);
        throw new UnauthorizedException('Account locked for 30 minutes.');
      }
      await this.userRepo.save(user);
      throw new UnauthorizedException(
        `Invalid credentials. ${5 - user.loginAttempts} attempts remaining.`,
      );
    }

    user.loginAttempts = 0;
    user.lockedUntil = null;
    await this.userRepo.save(user);

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user.id);
    await this.saveRefreshToken(user.id, refreshToken, deviceInfo);
    this.setRefreshTokenCookie(res, refreshToken);

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  // ==================== REFRESH ====================

  async refresh(userId: string, rawToken: string, res: Response) {
    const activeTokens = await this.refreshTokenRepo.find({
      where: { userId, isRevoked: false },
    });

    let matchedToken: RefreshToken | null = null;
    for (const t of activeTokens) {
      const isMatch = await bcrypt.compare(rawToken, t.token);
      if (isMatch) {
        matchedToken = t;
        break;
      }
    }

    if (!matchedToken || matchedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    matchedToken.isRevoked = true;
    await this.refreshTokenRepo.save(matchedToken);

    const accessToken = this.generateAccessToken(user);
    const newRefreshToken = this.generateRefreshToken(user.id);
    await this.saveRefreshToken(
      user.id,
      newRefreshToken,
      matchedToken.deviceInfo,
    );
    this.setRefreshTokenCookie(res, newRefreshToken);

    return { access_token: accessToken };
  }

  // ==================== LOGOUT ====================

  async logout(res: Response, rawRefreshToken?: string, userId?: string) {
    if (rawRefreshToken && userId) {
      const activeTokens = await this.refreshTokenRepo.find({
        where: { userId, isRevoked: false },
      });
      for (const t of activeTokens) {
        const isMatch = await bcrypt.compare(rawRefreshToken, t.token);
        if (isMatch) {
          t.isRevoked = true;
          await this.refreshTokenRepo.save(t);
          break;
        }
      }
    }
    res.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }

  // ==================== LOGOUT ALL ====================

  async logoutAll(userId: string, res: Response) {
    await this.refreshTokenRepo.update(
      { userId, isRevoked: false },
      { isRevoked: true },
    );
    res.clearCookie('refresh_token');
    return { message: 'Logged out from all devices successfully' };
  }

  // ==================== ME ====================

  async me(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const { password, ...result } = user;
    return result;
  }

  // ==================== CHANGE PASSWORD ====================

  async changePassword(dto: ChangePasswordDto, userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const valid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!valid) throw new BadRequestException('Current password is incorrect');

    user.password = await bcrypt.hash(dto.newPassword, 12);
    await this.userRepo.save(user);

    await this.refreshTokenRepo.update(
      { userId, isRevoked: false },
      { isRevoked: true },
    );
    return { message: 'Password changed successfully. Please login again.' };
  }

  // ==================== FORGOT PASSWORD ====================

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user)
      return { message: 'If this email exists, a reset code has been sent.' };

    const token = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = token;
    user.resetPasswordExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await this.userRepo.save(user);

    // TODO: send email
    console.log(`Reset token for ${user.email}: ${token}`);
    return { message: 'If this email exists, a reset code has been sent.' };
  }

  // ==================== RESET PASSWORD ====================

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });

    if (
      !user ||
      !user.resetPasswordToken ||
      !user.resetPasswordExpiry ||
      user.resetPasswordToken !== dto.token ||
      user.resetPasswordExpiry < new Date()
    ) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    user.password = await bcrypt.hash(dto.newPassword, 12);
    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;
    user.loginAttempts = 0;
    user.lockedUntil = null;
    await this.userRepo.save(user);

    await this.refreshTokenRepo.update(
      { userId: user.id, isRevoked: false },
      { isRevoked: true },
    );
    return { message: 'Password reset successfully. Please login again.' };
  }
}

import { prisma } from '../../core/database/prisma.service';
import { CreateUserDto, LoginDto } from './dto/user.dto';
import { comparePasswords, generateAuthToken } from '../../core/utils/auth';
import { uploadImage } from '../../core/utils/upload';
import { UnauthorizedError } from '../../core/errors/unauthorized.error';
import { ConflictError } from '../../core/errors/conflict.error';
import bcrypt from 'bcrypt';
import { EntityType } from '@prisma/client';
import { auditService } from '../../core/services/audit.service';

export class UserService {
  private static instance: UserService;

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async register(createUserDto: CreateUserDto, file?: Express.Multer.File) {
    const existingUser = await prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictError('Email already in use');
    }

    let profilePicture = '';
    if (file) {
      profilePicture = await uploadImage(file);
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
        role: createUserDto.role,
        phone: createUserDto.phone,
        profile_picture: profilePicture ?? '',
        bio: createUserDto.bio ?? ''
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        profile_picture: true,
        bio: true
      }
    });

    await auditService.log(user.id, 'CREATE', EntityType.User, user.id);
    const token = await generateAuthToken(user);
    return { user, token };
  }

  async login(loginDto: LoginDto) {
    const user = await prisma.user.findUnique({
      where: { email: loginDto.email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        phone: true,
        profile_picture: true,
        bio: true
      }
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await comparePasswords(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const { password, ...userWithoutPassword } = user;
    const token = generateAuthToken(user);

    await auditService.log(user.id, 'READ', EntityType.User, user.id);
    return {
      user: userWithoutPassword,
      token
    };
  }

  async getProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        profile_picture: true,
        bio: true
      }
    });

    if (!user) {
      throw new UnauthorizedError('Invalid user ID');
    }

    await auditService.log(userId, 'READ', EntityType.User, userId);
    return user;
  }

  async updateProfile(userId: number, updateData: Partial<CreateUserDto>, file?: Express.Multer.File) {
    let profilePicture = undefined;
    if (file) {
      profilePicture = await uploadImage(file);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: updateData.name,
        phone: updateData.phone,
        bio: updateData.bio,
        ...(profilePicture && { profile_picture: profilePicture })
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        profile_picture: true,
        bio: true
      }
    });

    await auditService.log(userId, 'UPDATE', EntityType.User, userId);
    return user;
  }
}

export const userService = UserService.getInstance();

import { UserService } from '../user.service';
import { prisma } from '../../../core/database/prisma.service';
import { auditService } from '../../../core/services/audit.service';
import { ConflictError } from '../../../core/errors/conflict.error';
import { UnauthorizedError } from '../../../core/errors/unauthorized.error';
import { EntityType } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateAuthToken, comparePasswords } from '../../../core/utils/auth';
import { uploadImage } from '../../../core/utils/upload';
import { UserRole } from '../dto/user.dto';

// Mock dependencies
jest.mock('../../../core/database/prisma.service', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('../../../core/services/audit.service', () => ({
  auditService: {
    log: jest.fn(),
  },
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('../../../core/utils/auth', () => ({
  generateAuthToken: jest.fn(),
  comparePasswords: jest.fn(),
}));

jest.mock('../../../core/utils/upload', () => ({
  uploadImage: jest.fn(),
}));

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = UserService.getInstance();
    jest.clearAllMocks();
  });

  describe('register', () => {
    const mockCreateUserDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: UserRole.USER,
      phone: '1234567890',
      bio: 'Test bio',
    };

    const mockFile = {
      filename: 'test.jpg',
    } as Express.Multer.File;

    it('should successfully register a new user', async () => {
      // Mock dependencies
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (uploadImage as jest.Mock).mockResolvedValue('profile-picture-url');
      
      const mockCreatedUser = {
        id: 1,
        ...mockCreateUserDto,
        profile_picture: 'profile-picture-url',
      };
      (prisma.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);
      (generateAuthToken as jest.Mock).mockReturnValue('mockToken');

      const result = await userService.register(mockCreateUserDto, mockFile);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockCreateUserDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(mockCreateUserDto.password, 10);
      expect(uploadImage).toHaveBeenCalledWith(mockFile);
      expect(prisma.user.create).toHaveBeenCalled();
      expect(auditService.log).toHaveBeenCalledWith(1, 'CREATE', EntityType.User, 1);
      expect(result).toEqual({
        user: mockCreatedUser,
        token: 'mockToken',
      });
    });

    it('should throw ConflictError if user already exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 1 });

      await expect(userService.register(mockCreateUserDto)).rejects.toThrow('Email already in use');
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const mockLoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUser = {
      id: 1,
      email: 'test@example.com',
      password: 'hashedPassword',
      name: 'Test User',
      role: UserRole.USER,
    };

    it('should successfully login a user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (comparePasswords as jest.Mock).mockResolvedValue(true);
      (generateAuthToken as jest.Mock).mockReturnValue('mockToken');

      const result = await userService.login(mockLoginDto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockLoginDto.email },
        select: expect.any(Object),
      });
      expect(auditService.log).toHaveBeenCalledWith(1, 'READ', EntityType.User, 1);
      expect(result).toEqual({
        user: expect.objectContaining({ id: 1, email: 'test@example.com' }),
        token: 'mockToken',
      });
    });

    it('should throw UnauthorizedError if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(userService.login(mockLoginDto)).rejects.toThrow('Invalid email or password');
    });

    it('should throw UnauthorizedError if password is invalid', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (comparePasswords as jest.Mock).mockResolvedValue(false);

      await expect(userService.login(mockLoginDto)).rejects.toThrow('Invalid email or password');
    });
  });

  describe('getProfile', () => {
    const userId = 1;
    const mockUser = {
      id: userId,
      name: 'Test User',
      email: 'test@example.com',
      role: UserRole.USER,
    };

    it('should successfully return user profile', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.getProfile(userId);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: expect.any(Object),
      });
      expect(auditService.log).toHaveBeenCalledWith(userId, 'READ', EntityType.User, userId);
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedError if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(userService.getProfile(userId)).rejects.toThrow('Invalid user ID');
    });
  });

  describe('updateProfile', () => {
    const userId = 1;
    const mockUpdateData = {
      name: 'Updated Name',
      phone: '9876543210',
      bio: 'Updated bio',
    };

    const mockFile = {
      filename: 'updated.jpg',
    } as Express.Multer.File;

    it('should successfully update user profile', async () => {
      const mockUpdatedUser = {
        id: userId,
        ...mockUpdateData,
        profile_picture: 'updated-profile-url',
      };

      (uploadImage as jest.Mock).mockResolvedValue('updated-profile-url');
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

      const result = await userService.updateProfile(userId, mockUpdateData, mockFile);

      expect(uploadImage).toHaveBeenCalledWith(mockFile);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: expect.objectContaining(mockUpdateData),
        select: expect.any(Object),
      });
      expect(auditService.log).toHaveBeenCalledWith(userId, 'UPDATE', EntityType.User, userId);
      expect(result).toEqual(mockUpdatedUser);
    });

    it('should update profile without file', async () => {
      const mockUpdatedUser = {
        id: userId,
        ...mockUpdateData,
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

      const result = await userService.updateProfile(userId, mockUpdateData);

      expect(uploadImage).not.toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: expect.objectContaining(mockUpdateData),
        select: expect.any(Object),
      });
      expect(auditService.log).toHaveBeenCalledWith(userId, 'UPDATE', EntityType.User, userId);
      expect(result).toEqual(mockUpdatedUser);
    });
  });
});

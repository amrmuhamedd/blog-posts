import { prisma } from '../../core/database/prisma.service';
import { CreateUserDto, LoginDto } from './dto/user.dto';
import { comparePasswords, generateAuthToken } from '../../core/utils/auth';
import { uploadImage } from '../../core/utils/upload';
import { UnauthorizedError } from '../../core/errors/unauthorized.error';
import { ConflictError } from '../../core/errors/conflict.error';
import bcrypt from 'bcrypt';

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
      throw new ConflictError('User already exists');
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
        phone: true
      },
    });

    const token = await generateAuthToken(user);
    return { user, token };
  }

  async login(loginDto: LoginDto) {
    const user = await prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isPasswordValid = await comparePasswords(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const token = generateAuthToken(user);
    return { token };
  }
}

export const userService = UserService.getInstance();

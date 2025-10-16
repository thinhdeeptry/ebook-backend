import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        avatar: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(createUserDto: CreateUserDto, creatorRole: Role) {
    // Only admins can create users with admin or teacher roles
    if (
      (createUserDto.role === Role.ADMIN || createUserDto.role === Role.TEACHER) &&
      creatorRole !== Role.ADMIN
    ) {
      throw new ForbiddenException('Insufficient permissions to create this user type');
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        role: createUserDto.role || Role.STUDENT,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        avatar: true,
        createdAt: true,
      },
    });

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, updaterRole: Role, updaterId: string) {
    const user = await this.findOne(id);

    // Users can only update their own profile unless they are admin
    if (id !== updaterId && updaterRole !== Role.ADMIN) {
      throw new ForbiddenException('You can only update your own profile');
    }

    // Only admins can change user roles and active status
    if ((updateUserDto.role || updateUserDto.isActive !== undefined) && updaterRole !== Role.ADMIN) {
      throw new ForbiddenException('Insufficient permissions to modify user role or status');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  async remove(id: string, removerRole: Role) {
    // Only admins can delete users
    if (removerRole !== Role.ADMIN) {
      throw new ForbiddenException('Insufficient permissions to delete users');
    }

    const user = await this.findOne(id);

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }

  async findByRole(role: Role) {
    return this.prisma.user.findMany({
      where: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        avatar: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getUserStats(id: string) {
    const user = await this.findOne(id);

    // const stats = await this.prisma.user.findUnique({
    //   where: { id },
    //   select: {
    //     _count: {
    //       select: {
    //         ebooks: true,
    //         h5pContents: true,
    //         trackingEvents: true,
    //       },
    //     },
    //   },
    // });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      // stats: stats?._count || { ebooks: 0, h5pContents: 0, trackingEvents: 0 },
    };
  }
}
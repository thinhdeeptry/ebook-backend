import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateClassDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên lớp không được để trống' })
  name: string;

  @IsInt({ message: 'Cấp lớp phải là số nguyên' })
  @Min(1, { message: 'Cấp lớp phải từ 1 đến 12' })
  @Max(12, { message: 'Cấp lớp phải từ 1 đến 12' })
  @Type(() => Number)
  gradeLevel: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateClassDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsInt({ message: 'Cấp lớp phải là số nguyên' })
  @Min(1, { message: 'Cấp lớp phải từ 1 đến 12' })
  @Max(12, { message: 'Cấp lớp phải từ 1 đến 12' })
  @Type(() => Number)
  @IsOptional()
  gradeLevel?: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class AddStudentToClassDto {
  @IsString()
  @IsNotEmpty({ message: 'ID học sinh không được để trống' })
  userId: string;
}

export class ClassResponseDto {
  id: string;
  name: string;
  gradeLevel: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    memberships: number;
    books: number;
  };
}

export class ClassWithMembersDto extends ClassResponseDto {
  memberships: {
    id: string;
    joinedAt: Date;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      avatar?: string;
    };
  }[];
}

export class ClassWithBooksDto extends ClassResponseDto {
  books: {
    id: string;
    title: string;
    description?: string;
    thumbnailUrl?: string;
    isPublished: boolean;
    createdAt: Date;
    chapters: {
      id: string;
      title: string;
      _count?: {
        lessons: number;
      };
    }[];
  }[];
}
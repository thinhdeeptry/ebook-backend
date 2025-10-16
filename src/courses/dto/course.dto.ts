import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsUrl } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề khóa học không được để trống' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl({}, { message: 'URL thumbnail không hợp lệ' })
  @IsOptional()
  thumbnailUrl?: string;

  @IsString()
  @IsNotEmpty({ message: 'ID lớp học không được để trống' })
  classId: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}

export class UpdateCourseDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl({}, { message: 'URL thumbnail không hợp lệ' })
  @IsOptional()
  thumbnailUrl?: string;

  @IsString()
  @IsOptional()
  classId?: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}

export class CourseResponseDto {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  isPublished: boolean;
  classId: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    lessons: number;
  };
}

export class CourseWithClassDto extends CourseResponseDto {
  class: {
    id: string;
    name: string;
    gradeLevel: number;
    description?: string;
  };
}

export class CourseWithLessonsDto extends CourseResponseDto {
  lessons: {
    id: string;
    title: string;
    description?: string;
    order: number;
    createdAt: Date;
    _count?: {
      steps: number;
    };
  }[];
}

export class CourseDetailDto extends CourseWithClassDto {
  lessons: {
    id: string;
    title: string;
    description?: string;
    order: number;
    createdAt: Date;
    _count?: {
      steps: number;
    };
  }[];
}
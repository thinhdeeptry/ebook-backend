import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLessonDto {
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề bài học không được để trống' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt({ message: 'Thứ tự phải là số nguyên' })
  @Min(1, { message: 'Thứ tự phải lớn hơn 0' })
  @Type(() => Number)
  order: number;

  @IsString()
  @IsNotEmpty({ message: 'ID khóa học không được để trống' })
  courseId: string;
}

export class UpdateLessonDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt({ message: 'Thứ tự phải là số nguyên' })
  @Min(1, { message: 'Thứ tự phải lớn hơn 0' })
  @Type(() => Number)
  @IsOptional()
  order?: number;

  @IsString()
  @IsOptional()
  courseId?: string;
}

export class ReorderLessonsDto {
  @IsString({ each: true })
  @IsNotEmpty({ message: 'Danh sách ID bài học không được để trống' })
  lessonIds: string[];
}

export class LessonResponseDto {
  id: string;
  title: string;
  description?: string;
  order: number;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    steps: number;
  };
}

export class LessonWithCourseDto extends LessonResponseDto {
  course: {
    id: string;
    title: string;
    description?: string;
    isPublished: boolean;
    class: {
      id: string;
      name: string;
      gradeLevel: number;
    };
  };
}

export class LessonWithStepsDto extends LessonResponseDto {
  steps: {
    id: string;
    title: string;
    order: number;
    contentType: 'TEXT' | 'VIDEO' | 'H5P';
    contentJson?: any;
    h5pContentId?: string;
    h5pContent?: {
      id: string;
      title: string;
      library: string;
    };
  }[];
}

export class LessonDetailDto extends LessonWithCourseDto {
  steps: {
    id: string;
    title: string;
    order: number;
    contentType: 'TEXT' | 'VIDEO' | 'H5P';
    contentJson?: any;
    h5pContentId?: string;
    h5pContent?: {
      id: string;
      title: string;
      library: string;
      isPublic: boolean;
    };
  }[];
}

export class LessonNavigationDto {
  id: string;
  title: string;
  order: number;
}

export class NavigationResponseDto {
  current: LessonNavigationDto;
  previous?: LessonNavigationDto | null;
  next?: LessonNavigationDto | null;
  course: {
    id: string;
    title: string;
    totalLessons: number;
  };
}
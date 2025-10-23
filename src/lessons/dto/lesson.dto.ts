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
  @IsOptional()
  chapterId?: string;

  @IsString()
  @IsOptional()
  bookId?: string;
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
  chapterId?: string;

  @IsString()
  @IsOptional()
  bookId?: string;
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
  chapterId?: string;
  bookId?: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    pages: number;
  };
}

export class LessonWithBookDto extends LessonResponseDto {
  chapter?: {
    id: string;
    title: string;
    order: number;
  };
  book?: {
    id: string;
    title: string;
    subject: string;
    grade: number;
    description?: string;
    isPublished: boolean;
  };
}

export class LessonWithPagesDto extends LessonResponseDto {
  pages: {
    id: string;
    title?: string;
    order: number;
    layout?: string;
    blocks: {
      id: string;
      order: number;
      blockType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'H5P';
      contentJson?: any;
      h5pContentId?: string;
    }[];
  }[];
}

export class LessonDetailDto extends LessonWithBookDto {
  pages: {
    id: string;
    title?: string;
    order: number;
    layout?: string;
    blocks: {
      id: string;
      order: number;
      blockType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'H5P';
      contentJson?: any;
      h5pContentId?: string;
      h5pContent?: {
        id: string;
        title: string;
        library: string;
        isPublic: boolean;
      };
    }[];
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
  book?: {
    id: string;
    title: string;
    totalLessons: number;
  };
  chapter?: {
    id: string;
    title: string;
    totalLessons: number;
  };
}
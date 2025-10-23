import { IsString, IsInt, IsBoolean, IsOptional, MinLength, MaxLength, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookDto {
  @ApiProperty({
    description: 'Tên sách giáo khoa',
    example: 'Sách giáo khoa Toán lớp 1',
    minLength: 3,
    maxLength: 200,
  })
  @IsString()
  @MinLength(3, { message: 'Tên sách phải có ít nhất 3 ký tự' })
  @MaxLength(200, { message: 'Tên sách không được vượt quá 200 ký tự' })
  title: string;

  @ApiProperty({
    description: 'Môn học',
    example: 'Toán học',
  })
  @IsString()
  @MinLength(2, { message: 'Môn học phải có ít nhất 2 ký tự' })
  @MaxLength(100, { message: 'Môn học không được vượt quá 100 ký tự' })
  subject: string;

  @ApiProperty({
    description: 'Khối lớp (1-12)',
    example: 1,
    minimum: 1,
    maximum: 12,
  })
  @IsInt({ message: 'Khối lớp phải là số nguyên' })
  @Min(1, { message: 'Khối lớp phải từ 1 trở lên' })
  @Max(12, { message: 'Khối lớp không được vượt quá 12' })
  grade: number;

  @ApiPropertyOptional({
    description: 'Mô tả sách',
    example: 'Sách giáo khoa Toán học dành cho học sinh lớp 1',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Mô tả không được vượt quá 1000 ký tự' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Ảnh bìa sách',
    example: 'https://example.com/cover.jpg',
  })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({
    description: 'Nhà xuất bản',
    example: 'Nhà xuất bản Giáo dục Việt Nam',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Tên nhà xuất bản không được vượt quá 200 ký tự' })
  publisher?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái xuất bản',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Trạng thái xuất bản phải là boolean' })
  isPublished?: boolean;

  @ApiPropertyOptional({
    description: 'Danh sách ID các lớp học sử dụng sách này',
    example: ['class1', 'class2'],
    type: [String],
  })
  @IsOptional()
  classIds?: string[];
}

export class UpdateBookDto {
  @ApiPropertyOptional({
    description: 'Tên sách giáo khoa',
    example: 'Sách giáo khoa Toán lớp 1 (Cập nhật)',
  })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Tên sách phải có ít nhất 3 ký tự' })
  @MaxLength(200, { message: 'Tên sách không được vượt quá 200 ký tự' })
  title?: string;

  @ApiPropertyOptional({
    description: 'Môn học',
    example: 'Toán học',
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Môn học phải có ít nhất 2 ký tự' })
  @MaxLength(100, { message: 'Môn học không được vượt quá 100 ký tự' })
  subject?: string;

  @ApiPropertyOptional({
    description: 'Khối lớp (1-12)',
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: 'Khối lớp phải là số nguyên' })
  @Min(1, { message: 'Khối lớp phải từ 1 trở lên' })
  @Max(12, { message: 'Khối lớp không được vượt quá 12' })
  grade?: number;

  @ApiPropertyOptional({
    description: 'Mô tả sách',
    example: 'Sách giáo khoa Toán học dành cho học sinh lớp 1 (phiên bản cập nhật)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Mô tả không được vượt quá 1000 ký tự' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Ảnh bìa sách',
    example: 'https://example.com/new-cover.jpg',
  })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({
    description: 'Nhà xuất bản',
    example: 'Nhà xuất bản Giáo dục Việt Nam',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Tên nhà xuất bản không được vượt quá 200 ký tự' })
  publisher?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái xuất bản',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Trạng thái xuất bản phải là boolean' })
  isPublished?: boolean;

  @ApiPropertyOptional({
    description: 'Danh sách ID các lớp học sử dụng sách này',
    example: ['class1', 'class2'],
    type: [String],
  })
  @IsOptional()
  classIds?: string[];
}

export class BookQueryDto {
  @ApiPropertyOptional({
    description: 'Tìm kiếm theo từ khóa',
    example: 'Toán học',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo môn học',
    example: 'Toán học',
  })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo khối lớp',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  grade?: number;

  @ApiPropertyOptional({
    description: 'Lọc theo trạng thái xuất bản',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({
    description: 'Lọc theo lớp học',
    example: 'class-id',
  })
  @IsOptional()
  @IsString()
  classId?: string;
}
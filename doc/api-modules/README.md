# HỆ THỐNG QUẢN LÝ GIÁO DỤC - TÀI LIỆU API

## Tổng quan

Hệ thống quản lý giáo dục được xây dựng trên NestJS với cấu trúc phân cấp rõ ràng từ **Lớp học** → **Khóa học** → **Bài học** → **Bước học** → **Tiến độ học tập**.

## Cấu trúc hệ thống

```
📚 Lớp học (Classes)
  └── 📖 Khóa học (Courses) 
      └── 📝 Bài học (Lessons)
          └── 🎯 Bước học (LessonSteps)
              └── 📊 Tiến độ học tập (StudentProgress)
```

## Modules API đã triển khai

### 1. [Classes Module](./classes-api.md) - Quản lý Lớp học
- **Mục đích**: Quản lý các lớp học từ Lớp 1 đến Lớp 5
- **Chức năng chính**:
  - CRUD lớp học
  - Ghi danh học sinh vào lớp
  - Thống kê thành viên lớp
  - Tìm kiếm và lọc lớp học

### 2. [Courses Module](./courses-api.md) - Quản lý Khóa học
- **Mục đích**: Quản lý các môn học trong từng lớp (Toán, Tiếng Việt, ...)
- **Chức năng chính**:
  - CRUD khóa học
  - Xuất bản/ẩn khóa học
  - Thống kê bài học trong khóa
  - Tìm kiếm theo từ khóa

### 3. [Lessons Module](./lessons-api.md) - Quản lý Bài học
- **Mục đích**: Quản lý từng bài học cụ thể trong khóa học
- **Chức năng chính**:
  - CRUD bài học
  - Sắp xếp thứ tự bài học
  - Sao chép bài học
  - Thống kê bước học

### 4. [LessonSteps Module](./lesson-steps-api.md) - Quản lý Bước học
- **Mục đích**: Quản lý các bước học với 3 loại nội dung: TEXT, VIDEO, H5P
- **Chức năng chính**:
  - CRUD bước học
  - Sắp xếp thứ tự bước học
  - Tích hợp nội dung H5P
  - Sao chép bước học

### 5. [StudentProgress Module](./student-progress-api.md) - Theo dõi Tiến độ
- **Mục đích**: Theo dõi tiến độ học tập của từng học sinh
- **Chức năng chính**:
  - Ghi nhận tiến độ học tập
  - Quản lý lần làm quiz
  - Thống kê tổng quan
  - Báo cáo chi tiết

### 6. [H5P Module](./h5p-integration.md) - Tích hợp H5P
- **Mục đích**: Tích hợp nội dung tương tác H5P vào bước học
- **Chức năng đã mở rộng**:
  - Liên kết với bước học
  - Quản lý nội dung công khai/riêng tư
  - Theo dõi xAPI events

## Phân quyền truy cập

### ADMIN (Quản trị viên)
- **Toàn quyền**: Tất cả chức năng của hệ thống
- **Đặc biệt**: Xóa dữ liệu, quản lý người dùng, thống kê hệ thống

### TEACHER (Giáo viên)
- **Quản lý nội dung**: Tạo, sửa, xóa lớp/khóa/bài học/bước học
- **Theo dõi học sinh**: Xem tiến độ, thống kê lớp học
- **Hạn chế**: Không thể xóa dữ liệu quan trọng

### STUDENT (Học sinh)
- **Học tập**: Truy cập nội dung đã được phân quyền
- **Tiến độ cá nhân**: Xem và cập nhật tiến độ học tập của mình
- **Hạn chế**: Chỉ truy cập lớp đã ghi danh

## Luồng dữ liệu chính

### 1. Thiết lập lớp học
```
1. Admin/Teacher tạo Class (Lớp 1, 2, 3...)
2. Ghi danh Students vào Class
3. Tạo Courses (Toán, Văn...) trong Class
```

### 2. Xây dựng nội dung
```
1. Tạo Lessons trong Course
2. Thêm LessonSteps vào Lesson
3. Cấu hình nội dung cho từng Step (TEXT/VIDEO/H5P)
```

### 3. Học tập và theo dõi
```
1. Students truy cập LessonSteps
2. Hệ thống ghi nhận StudentProgress
3. Teachers/Admin theo dõi tiến độ và thống kê
```

## Cơ sở dữ liệu

Hệ thống sử dụng **PostgreSQL** với **Prisma ORM** và các quan hệ sau:

- `User` → `ClassMembership` ← `Class`
- `Class` → `Course` → `Lesson` → `LessonStep`
- `User` + `LessonStep` → `StudentProgress` → `QuizAttempt`
- `LessonStep` ↔ `H5PContent` (liên kết qua h5pContentId)

## Validation và Error Handling

### Validation Messages (Tiếng Việt)
- Tất cả các trường đều có thông báo lỗi bằng tiếng Việt
- Sử dụng `class-validator` với custom messages
- Kiểm tra nghiệp vụ logic (ví dụ: học sinh phải thuộc lớp học)

### Error Responses
```javascript
{
  "statusCode": 400,
  "message": "Tiêu đề khóa học không được để trống",
  "error": "Bad Request"
}
```

## API Documentation Links

- [Classes API - Quản lý Lớp học](./classes-api.md)
- [Courses API - Quản lý Khóa học](./courses-api.md) 
- [Lessons API - Quản lý Bài học](./lessons-api.md)
- [LessonSteps API - Quản lý Bước học](./lesson-steps-api.md)
- [StudentProgress API - Theo dõi Tiến độ](./student-progress-api.md)
- [H5P Integration - Tích hợp H5P](./h5p-integration.md)

## Testing và Development

### Postman Collection
- Import collection từ `doc/test/postman-collection.json`
- Environment variables đã được cấu hình sẵn
- Test scenarios cho từng module

### Development Guidelines
1. **Tuân thủ cấu trúc**: Controller → Service → Prisma
2. **Validation đầy đủ**: Sử dụng DTOs với class-validator
3. **Error handling**: Throw appropriate HTTP exceptions
4. **Logging**: Sử dụng NestJS built-in logger
5. **Documentation**: Cập nhật API docs khi thay đổi

---

**Phiên bản**: 1.0  
**Cập nhật**: {{current_date}}  
**Liên hệ**: Team phát triển hệ thống giáo dục
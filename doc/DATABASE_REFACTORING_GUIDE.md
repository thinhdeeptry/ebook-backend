# Database Refactoring Guide - From Course/LessonStep to Book/Chapter/Page/PageBlock

## Tổng quan về việc Refactoring

Hệ thống đã được refactor từ mô hình phẳng **Course → LessonStep** sang mô hình phân cấp **Book → Chapter → Lesson → Page → PageBlock** để phù hợp hơn với ứng dụng đọc sách điện tử (E-book Reader).

## Thay đổi Database Schema

### Mô hình cũ (Đã xóa)
```
Course (1) ←→ (n) Lesson (1) ←→ (n) LessonStep
Class (n) ←→ (n) Course
StudentProgress: userId + lessonStepId
```

### Mô hình mới
```
Book (1) ←→ (n) Chapter (1) ←→ (n) Lesson (1) ←→ (n) Page (1) ←→ (n) PageBlock
Class (n) ←→ (n) Book (many-to-many)
StudentProgress: userId + pageBlockId
```

## Chi tiết các Model

### 1. Book Model
```prisma
model Book {
  id          String   @id @default(cuid())
  title       String
  subject     String   // Môn học (Toán, Văn, etc.)
  grade       Int      // Cấp lớp (1-12)
  description String?
  thumbnailUrl String?
  isPublished Boolean  @default(false)
  createdAt   Date     @default(now())
  updatedAt   Date     @updatedAt

  chapters    Chapter[]
  classes     Class[]   // Many-to-many với Class
  
  @@map("books")
}
```

### 2. Chapter Model
```prisma
model Chapter {
  id          String   @id @default(cuid())
  bookId      String
  title       String
  order       Int
  description String?
  createdAt   Date     @default(now())
  updatedAt   Date     @updatedAt

  book        Book      @relation(fields: [bookId], references: [id], onDelete: Cascade)
  lessons     Lesson[]
  
  @@map("chapters")
}
```

### 3. Lesson Model (Cập nhật)
```prisma
model Lesson {
  id          String   @id @default(cuid())
  bookId      String   // Thêm mới
  chapterId   String   // Thêm mới
  title       String
  order       Int
  description String?
  createdAt   Date     @default(now())
  updatedAt   Date     @updatedDate

  book        Book      @relation(fields: [bookId], references: [id], onDelete: Cascade)
  chapter     Chapter   @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  pages       Page[]
  
  @@map("lessons")
}
```

### 4. Page Model (Mới)
```prisma
model Page {
  id          String   @id @default(cuid())
  lessonId    String
  title       String
  order       Int
  createdAt   Date     @default(now())
  updatedAt   Date     @updatedAt

  lesson      Lesson     @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  pageBlocks  PageBlock[]
  
  @@map("pages")
}
```

### 5. PageBlock Model (Thay thế LessonStep)
```prisma
model PageBlock {
  id           String        @id @default(cuid())
  pageId       String
  order        Int
  blockType    PageBlockType // TEXT, VIDEO, H5P, IMAGE, QUIZ
  contentJson  Json?
  h5pContentId String?

  page       Page         @relation(fields: [pageId], references: [id], onDelete: Cascade)
  h5pContent H5PContent?  @relation(fields: [h5pContentId], references: [id], onDelete: SetNull)
  progress   StudentProgress[]

  @@map("page_blocks")
}
```

### 6. StudentProgress Model (Cập nhật)
```prisma
model StudentProgress {
  id           String         @id @default(cuid())
  userId       String
  pageBlockId  String         // Thay đổi từ lessonStepId
  status       ProgressStatus @default(NOT_STARTED)
  // ... các field khác

  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  pageBlock    PageBlock  @relation(fields: [pageBlockId], references: [id], onDelete: Cascade)
  
  @@unique([userId, pageBlockId])
  @@map("student_progress")
}
```

## Thay đổi API Endpoints

### Classes API
| Endpoint Cũ | Endpoint Mới | Thay đổi |
|-------------|-------------|----------|
| `GET /classes/:id/courses` | `GET /classes/:id/books` | courses → books |

### Courses API (Đã xóa)
Toàn bộ `/courses` endpoints đã được thay thế bởi `/books`

### Books API (Mới)
- `GET /books` - Lấy danh sách sách
- `POST /books` - Tạo sách mới
- `GET /books/:id` - Lấy chi tiết sách
- `PUT /books/:id` - Cập nhật sách
- `DELETE /books/:id` - Xóa sách
- `GET /books/class/:classId` - Lấy sách theo lớp

### Lessons API (Cập nhật)
| Endpoint Cũ | Endpoint Mới | Thay đổi |
|-------------|-------------|----------|
| `GET /lessons/course/:courseId` | `GET /lessons/book/:bookId` | courseId → bookId |
| | `GET /lessons/chapter/:chapterId` | Endpoint mới |

### LessonSteps API (Đã xóa)
Toàn bộ `/lesson-steps` endpoints đã được thay thế

### StudentProgress API (Cập nhật)
| Endpoint Cũ | Endpoint Mới | Thay đổi |
|-------------|-------------|----------|
| `PATCH /student-progress/:id` | `PATCH /student-progress/:userId/:pageBlockId` | Sử dụng composite key |
| `DELETE /student-progress/:id` | `DELETE /student-progress/:userId/:pageBlockId` | Sử dụng composite key |
| `GET /student-progress/lesson/:lessonId` | `GET /student-progress/lesson/:lessonId` | Không đổi endpoint nhưng logic khác |

### H5P API (Cập nhật)
| Endpoint Cũ | Endpoint Mới | Thay đổi |
|-------------|-------------|----------|
| `GET /h5p/lesson-step/:lessonStepId/content` | `GET /h5p/page-block/:pageBlockId/content` | lessonStep → pageBlock |
| `POST /h5p/lesson-step/:lessonStepId/content` | `POST /h5p/page-block/:pageBlockId/content` | lessonStep → pageBlock |
| `GET /h5p/lesson/:lessonId/content` | `GET /h5p/page/:pageId/content` | lesson → page |
| `GET /h5p/course/:courseId/content` | `GET /h5p/book/:bookId/content` | course → book |

## Migration & Seeding

### Migration
```bash
# Chạy migration để cập nhật database
npx prisma migrate dev --name "refactor_to_book_structure"
```

### Seed Data Mới
Seed file đã được cập nhật để tạo:
- 3 sách mẫu (Toán lớp 1, Văn lớp 1, Tiếng Anh lớp 1)
- Mỗi sách có 2-3 chương
- Mỗi chương có 2-3 bài học
- Mỗi bài học có 2-4 trang
- Mỗi trang có 2-4 page blocks với các loại nội dung khác nhau

## Mapping dữ liệu cũ sang mới

### Nếu cần migrate dữ liệu từ hệ thống cũ:

1. **Course → Book**: 1:1 mapping
   - `Course.title` → `Book.title`
   - `Course.description` → `Book.description`
   - `Course.classId` → `Book.classes` (many-to-many)

2. **Lesson**: Cập nhật thêm fields
   - Thêm `bookId` và `chapterId`
   - Nhóm lessons theo course thành chapters

3. **LessonStep → PageBlock**: 1:1 mapping
   - `LessonStep.lessonId` → cần map qua Page
   - `LessonStep.contentType` → `PageBlock.blockType`
   - `LessonStep.textContent/videoUrl/h5pContentId` → `PageBlock.contentJson`

4. **StudentProgress**: Cập nhật key
   - `lessonStepId` → `pageBlockId`

## Breaking Changes

⚠️ **Cảnh báo**: Đây là breaking changes lớn. Cần cập nhật:

1. **Frontend Applications**: Cập nhật tất cả API calls
2. **Mobile Apps**: Cập nhật endpoints và data models  
3. **Third-party Integrations**: Cập nhật API documentation
4. **Database Backup**: Backup dữ liệu trước khi migrate

## Testing

Sử dụng Postman collection đã được cập nhật:
- `education-system-postman-collection.json`
- `education-system-environment.json`

## Rollback Plan

Trong trường hợp cần rollback:
1. Restore database từ backup trước khi migrate
2. Checkout về commit trước khi refactor
3. Redeploy với code cũ

## Performance Considerations

Mô hình mới có nhiều levels hơn, cần chú ý:
- Sử dụng `include` và `select` thích hợp trong Prisma queries
- Implement pagination cho các endpoint trả về nhiều data
- Consider caching cho nested relationships
- Monitor query performance với `prisma.$queryRaw` nếu cần

## Support & Migration

Để được hỗ trợ migration hoặc có thắc mắc:
1. Tham khảo file `API_DOCUMENTATION.md`
2. Sử dụng Postman collection để test
3. Check logs trong quá trình migration
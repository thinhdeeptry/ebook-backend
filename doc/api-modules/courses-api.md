# Courses API - Quản lý Khóa học

## Tổng quan

Module Courses quản lý các khóa học (môn học) trong từng lớp học. Mỗi khóa học thuộc về một lớp học cụ thể và chứa nhiều bài học. Ví dụ: "Toán học Lớp 1", "Tiếng Việt Lớp 2", "Khoa học Lớp 3".

## Base URL
```
/courses
```

## Endpoints

### 1. Tạo khóa học mới

**POST** `/courses`

**Quyền truy cập**: ADMIN, TEACHER

**Body request**:
```json
{
  "title": "Toán học Lớp 1",
  "description": "Khóa học Toán học dành cho học sinh lớp 1",
  "thumbnailUrl": "https://example.com/math-thumbnail.jpg",
  "classId": "cm123...",
  "isPublished": false
}
```

**Response thành công** (201):
```json
{
  "id": "course123...",
  "title": "Toán học Lớp 1",
  "description": "Khóa học Toán học dành cho học sinh lớp 1",
  "thumbnailUrl": "https://example.com/math-thumbnail.jpg",
  "isPublished": false,
  "classId": "cm123...",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "class": {
    "id": "cm123...",
    "name": "Lớp 1A",
    "gradeLevel": 1
  }
}
```

**Validation rules**:
- `title`: Bắt buộc, tối đa 200 ký tự
- `description`: Tùy chọn
- `thumbnailUrl`: Tùy chọn, phải là URL hợp lệ
- `classId`: Bắt buộc, phải tồn tại trong hệ thống
- `isPublished`: Tùy chọn, mặc định false

### 2. Lấy danh sách tất cả khóa học

**GET** `/courses`

**Query parameters**:
- `classId`: Lọc theo lớp học
- `isPublished`: Lọc theo trạng thái xuất bản (true/false)

**Response thành công** (200):
```json
[
  {
    "id": "course123...",
    "title": "Toán học Lớp 1",
    "description": "Khóa học Toán học dành cho học sinh lớp 1",
    "thumbnailUrl": "https://example.com/math-thumbnail.jpg",
    "isPublished": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "class": {
      "id": "cm123...",
      "name": "Lớp 1A",
      "gradeLevel": 1
    },
    "_count": {
      "lessons": 15
    }
  }
]
```

### 3. Lấy thông tin chi tiết khóa học

**GET** `/courses/{id}`

**Response thành công** (200):
```json
{
  "id": "course123...",
  "title": "Toán học Lớp 1",
  "description": "Khóa học Toán học dành cho học sinh lớp 1",
  "thumbnailUrl": "https://example.com/math-thumbnail.jpg",
  "isPublished": true,
  "classId": "cm123...",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "class": {
    "id": "cm123...",
    "name": "Lớp 1A",
    "gradeLevel": 1
  },
  "lessons": [
    {
      "id": "lesson123",
      "title": "Bài 1: Số từ 1 đến 10",
      "order": 1,
      "createdAt": "2024-01-16T09:00:00Z",
      "_count": {
        "steps": 5
      }
    }
  ],
  "_count": {
    "lessons": 15
  }
}
```

### 4. Cập nhật thông tin khóa học

**PATCH** `/courses/{id}`

**Quyền truy cập**: ADMIN, TEACHER

**Body request**:
```json
{
  "title": "Toán học Lớp 1 - Cập nhật",
  "description": "Mô tả mới",
  "isPublished": true
}
```

**Response thành công** (200):
```json
{
  "id": "course123...",
  "title": "Toán học Lớp 1 - Cập nhật", 
  "description": "Mô tả mới",
  "isPublished": true,
  "updatedAt": "2024-01-15T11:30:00Z",
  "class": {
    "id": "cm123...",
    "name": "Lớp 1A"
  }
}
```

### 5. Xóa khóa học

**DELETE** `/courses/{id}`

**Quyền truy cập**: ADMIN

**Response thành công** (204): Không có nội dung

**Lưu ý**: Sẽ xóa toàn bộ bài học và bước học liên quan

### 6. Xuất bản khóa học

**POST** `/courses/{id}/publish`

**Quyền truy cập**: ADMIN, TEACHER

**Response thành công** (200):
```json
{
  "message": "Đã xuất bản khóa học thành công",
  "course": {
    "id": "course123...",
    "title": "Toán học Lớp 1",
    "isPublished": true,
    "updatedAt": "2024-01-15T12:00:00Z"
  }
}
```

### 7. Ẩn khóa học

**POST** `/courses/{id}/unpublish`

**Quyền truy cập**: ADMIN, TEACHER

**Response thành công** (200):
```json
{
  "message": "Đã ẩn khóa học thành công",
  "course": {
    "id": "course123...",
    "title": "Toán học Lớp 1",
    "isPublished": false,
    "updatedAt": "2024-01-15T12:00:00Z"
  }
}
```

### 8. Lấy khóa học theo lớp

**GET** `/courses/class/{classId}`

**Response thành công** (200):
```json
[
  {
    "id": "course123...",
    "title": "Toán học Lớp 1",
    "description": "Khóa học Toán học dành cho học sinh lớp 1",
    "isPublished": true,
    "_count": {
      "lessons": 15
    }
  },
  {
    "id": "course456...",
    "title": "Tiếng Việt Lớp 1", 
    "description": "Khóa học Tiếng Việt dành cho học sinh lớp 1",
    "isPublished": true,
    "_count": {
      "lessons": 12
    }
  }
]
```

### 9. Tìm kiếm khóa học

**GET** `/courses/search?searchTerm={term}&classId={id}&isPublished={boolean}`

**Query parameters**:
- `searchTerm`: Từ khóa tìm kiếm (tiêu đề, mô tả)
- `classId`: Lọc theo lớp học
- `isPublished`: Lọc theo trạng thái xuất bản

**Response thành công** (200):
```json
[
  {
    "id": "course123...",
    "title": "Toán học Lớp 1",
    "description": "Khóa học Toán học dành cho học sinh lớp 1",
    "isPublished": true,
    "class": {
      "id": "cm123...",
      "name": "Lớp 1A",
      "gradeLevel": 1
    },
    "_count": {
      "lessons": 15
    }
  }
]
```

### 10. Sao chép khóa học

**POST** `/courses/{id}/duplicate`

**Quyền truy cập**: ADMIN, TEACHER

**Body request**:
```json
{
  "newTitle": "Toán học Lớp 1 (Bản sao)",
  "targetClassId": "cm456..." 
}
```

**Response thành công** (201):
```json
{
  "id": "course789...",
  "title": "Toán học Lớp 1 (Bản sao)",
  "description": "Khóa học Toán học dành cho học sinh lớp 1",
  "isPublished": false,
  "classId": "cm456...",
  "createdAt": "2024-01-15T14:00:00Z",
  "class": {
    "id": "cm456...",
    "name": "Lớp 1B"
  },
  "_count": {
    "lessons": 15
  }
}
```

### 11. Thống kê khóa học

**GET** `/courses/statistics?classId={id}`

**Query parameters**:
- `classId`: ID lớp học cụ thể (tùy chọn)

**Response thành công** (200):
```json
{
  "totalCourses": 40,
  "publishedCourses": 35,
  "unpublishedCourses": 5,
  "coursesByClass": {
    "cm123...": {
      "className": "Lớp 1A",
      "courseCount": 8
    }
  },
  "avgLessonsPerCourse": 12.5,
  "totalLessons": 500
}
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": [
    "Tiêu đề khóa học không được để trống",
    "URL thumbnail không hợp lệ"
  ],
  "error": "Bad Request"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy khóa học",
  "error": "Not Found"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Bạn không có quyền thực hiện thao tác này",
  "error": "Forbidden"
}
```

## Business Rules

1. **Thuộc lớp học**: Mỗi khóa học phải thuộc về một lớp học cụ thể
2. **Xuất bản**: Chỉ khóa học đã xuất bản mới hiển thị cho học sinh
3. **Quyền truy cập**: Học sinh chỉ xem khóa học của lớp mình tham gia
4. **Sao chép**: Khi sao chép khóa học, tất cả bài học cũng được sao chép

## Use Cases

### Tạo nội dung giảng dạy
1. Teacher tạo khóa học mới cho lớp
2. Thêm bài học vào khóa học
3. Xuất bản khi đã sẵn sàng

### Quản lý nội dung
1. Cập nhật thông tin khóa học
2. Thêm/xóa bài học
3. Ẩn/hiện khóa học theo nhu cầu

### Tái sử dụng nội dung
1. Sao chép khóa học sang lớp khác
2. Chỉnh sửa nội dung phù hợp

## Model Relationships

```prisma
model Course {
  id           String   @id @default(cuid())
  title        String
  description  String?
  thumbnailUrl String?
  isPublished  Boolean  @default(false)
  classId      String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relationships
  class   Class    @relation(fields: [classId], references: [id])
  lessons Lesson[]
}
```

## Access Control

### ADMIN
- Toàn quyền tạo, sửa, xóa khóa học
- Xem thống kê toàn hệ thống
- Xuất bản/ẩn khóa học

### TEACHER  
- Tạo, sửa khóa học
- Xuất bản/ẩn khóa học
- Không thể xóa khóa học có học sinh đang học

### STUDENT
- Chỉ xem khóa học đã xuất bản
- Chỉ xem khóa học của lớp mình tham gia
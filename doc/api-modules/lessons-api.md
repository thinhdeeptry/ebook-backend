# Lessons API - Quản lý Bài học

## Tổng quan

Module Lessons quản lý các bài học trong từng khóa học. Mỗi bài học thuộc về một khóa học cụ thể và chứa nhiều bước học (LessonSteps). Ví dụ: "Bài 1: Phép cộng trong phạm vi 10", "Bài 2: Phép trừ trong phạm vi 10".

## Base URL
```
/lessons
```

## Endpoints

### 1. Tạo bài học mới

**POST** `/lessons`

**Quyền truy cập**: ADMIN, TEACHER

**Body request**:
```json
{
  "title": "Bài 1: Phép cộng trong phạm vi 10",
  "description": "Học sinh sẽ học cách thực hiện phép cộng các số từ 1 đến 10",
  "courseId": "course123...",
  "order": 1
}
```

**Response thành công** (201):
```json
{
  "id": "lesson123...",
  "title": "Bài 1: Phép cộng trong phạm vi 10",
  "description": "Học sinh sẽ học cách thực hiện phép cộng các số từ 1 đến 10",
  "order": 1,
  "courseId": "course123...",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "course": {
    "id": "course123...",
    "title": "Toán học Lớp 1",
    "class": {
      "id": "class123",
      "name": "Lớp 1A",
      "gradeLevel": 1
    }
  }
}
```

**Validation rules**:
- `title`: Bắt buộc, tối đa 255 ký tự
- `description`: Tùy chọn
- `courseId`: Bắt buộc, phải tồn tại trong hệ thống
- `order`: Tùy chọn, sẽ tự động tính nếu không có

### 2. Lấy danh sách tất cả bài học

**GET** `/lessons`

**Query parameters**:
- `courseId`: Lọc theo khóa học
- `searchTerm`: Từ khóa tìm kiếm

**Response thành công** (200):
```json
[
  {
    "id": "lesson123...",
    "title": "Bài 1: Phép cộng trong phạm vi 10",
    "description": "Học sinh sẽ học cách thực hiện phép cộng các số từ 1 đến 10",
    "order": 1,
    "createdAt": "2024-01-15T10:30:00Z",
    "course": {
      "id": "course123...",
      "title": "Toán học Lớp 1",
      "class": {
        "id": "class123",
        "name": "Lớp 1A"
      }
    },
    "_count": {
      "steps": 8
    }
  }
]
```

### 3. Lấy thông tin chi tiết bài học

**GET** `/lessons/{id}`

**Response thành công** (200):
```json
{
  "id": "lesson123...",
  "title": "Bài 1: Phép cộng trong phạm vi 10",
  "description": "Học sinh sẽ học cách thực hiện phép cộng các số từ 1 đến 10",
  "order": 1,
  "courseId": "course123...",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "course": {
    "id": "course123...",
    "title": "Toán học Lớp 1",
    "class": {
      "id": "class123",
      "name": "Lớp 1A",
      "gradeLevel": 1
    }
  },
  "steps": [
    {
      "id": "step123",
      "title": "Giới thiệu phép cộng",
      "order": 1,
      "contentType": "TEXT",
      "h5pContent": null
    },
    {
      "id": "step456", 
      "title": "Video hướng dẫn",
      "order": 2,
      "contentType": "VIDEO",
      "h5pContent": null
    },
    {
      "id": "step789",
      "title": "Bài tập tương tác",
      "order": 3,
      "contentType": "H5P",
      "h5pContent": {
        "id": "h5p123",
        "title": "Quiz phép cộng",
        "library": "H5P.MultiChoice"
      }
    }
  ],
  "_count": {
    "steps": 8
  }
}
```

### 4. Cập nhật thông tin bài học

**PATCH** `/lessons/{id}`

**Quyền truy cập**: ADMIN, TEACHER

**Body request**:
```json
{
  "title": "Bài 1: Phép cộng trong phạm vi 10 - Cập nhật",
  "description": "Mô tả mới",
  "order": 2
}
```

**Response thành công** (200):
```json
{
  "id": "lesson123...",
  "title": "Bài 1: Phép cộng trong phạm vi 10 - Cập nhật",
  "description": "Mô tả mới", 
  "order": 2,
  "updatedAt": "2024-01-15T11:30:00Z",
  "course": {
    "id": "course123...",
    "title": "Toán học Lớp 1"
  }
}
```

### 5. Xóa bài học

**DELETE** `/lessons/{id}`

**Quyền truy cập**: ADMIN

**Response thành công** (204): Không có nội dung

**Lưu ý**: Sẽ xóa toàn bộ bước học và tiến độ học tập liên quan

### 6. Lấy bài học theo khóa học

**GET** `/lessons/course/{courseId}`

**Response thành công** (200):
```json
[
  {
    "id": "lesson123...",
    "title": "Bài 1: Phép cộng trong phạm vi 10",
    "description": "Học sinh sẽ học cách thực hiện phép cộng các số từ 1 đến 10",
    "order": 1,
    "createdAt": "2024-01-15T10:30:00Z",
    "_count": {
      "steps": 8
    }
  },
  {
    "id": "lesson456...",
    "title": "Bài 2: Phép trừ trong phạm vi 10",
    "description": "Học sinh sẽ học cách thực hiện phép trừ các số từ 1 đến 10",
    "order": 2,
    "createdAt": "2024-01-16T09:00:00Z",
    "_count": {
      "steps": 6
    }
  }
]
```

### 7. Sắp xếp lại thứ tự bài học

**POST** `/lessons/course/{courseId}/reorder`

**Quyền truy cập**: ADMIN, TEACHER

**Body request**:
```json
{
  "lessonIds": ["lesson456", "lesson123", "lesson789"]
}
```

**Response thành công** (200):
```json
{
  "message": "Đã cập nhật thứ tự bài học thành công"
}
```

### 8. Sao chép bài học

**POST** `/lessons/{id}/duplicate`

**Quyền truy cập**: ADMIN, TEACHER

**Body request**:
```json
{
  "newTitle": "Bài 1: Phép cộng trong phạm vi 10 (Bản sao)",
  "targetCourseId": "course456..."
}
```

**Response thành công** (201):
```json
{
  "id": "lesson999...",
  "title": "Bài 1: Phép cộng trong phạm vi 10 (Bản sao)",
  "description": "Học sinh sẽ học cách thực hiện phép cộng các số từ 1 đến 10",
  "order": 3,
  "courseId": "course456...",
  "createdAt": "2024-01-15T14:00:00Z",
  "course": {
    "id": "course456...",
    "title": "Toán học Lớp 2"
  },
  "_count": {
    "steps": 8
  }
}
```

### 9. Tìm kiếm bài học

**GET** `/lessons/search?searchTerm={term}&courseId={id}`

**Query parameters**:
- `searchTerm`: Từ khóa tìm kiếm (tiêu đề, mô tả)
- `courseId`: Lọc theo khóa học

**Response thành công** (200):
```json
[
  {
    "id": "lesson123...",
    "title": "Bài 1: Phép cộng trong phạm vi 10",
    "description": "Học sinh sẽ học cách thực hiện phép cộng các số từ 1 đến 10",
    "order": 1,
    "course": {
      "id": "course123...",
      "title": "Toán học Lớp 1",
      "class": {
        "id": "class123",
        "name": "Lớp 1A",
        "gradeLevel": 1
      }
    },
    "_count": {
      "steps": 8
    }
  }
]
```

### 10. Thống kê bài học

**GET** `/lessons/statistics?courseId={id}`

**Query parameters**:
- `courseId`: ID khóa học cụ thể (tùy chọn)

**Response thành công** (200):
```json
{
  "totalLessons": 150,
  "lessonsByCourse": {
    "course123": {
      "courseTitle": "Toán học Lớp 1",
      "lessonCount": 15
    }
  },
  "avgStepsPerLesson": 6.8,
  "totalSteps": 1020,
  "lessonsWithProgress": 120,
  "lessonsWithoutProgress": 30
}
```

### 11. Lấy bài học tiếp theo/trước đó

**GET** `/lessons/{id}/navigation`

**Response thành công** (200):
```json
{
  "current": {
    "id": "lesson123...",
    "title": "Bài 1: Phép cộng trong phạm vi 10",
    "order": 1
  },
  "previous": null,
  "next": {
    "id": "lesson456...",
    "title": "Bài 2: Phép trừ trong phạm vi 10", 
    "order": 2
  },
  "course": {
    "id": "course123...",
    "title": "Toán học Lớp 1",
    "totalLessons": 15
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": [
    "Tiêu đề bài học không được để trống",
    "Thứ tự bài học phải là số nguyên dương"
  ],
  "error": "Bad Request"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy bài học",
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

1. **Thứ tự bài học**: Bài học được sắp xếp theo thứ tự trong khóa học
2. **Thuộc khóa học**: Mỗi bài học phải thuộc về một khóa học cụ thể
3. **Cascade delete**: Xóa bài học sẽ xóa toàn bộ bước học liên quan
4. **Quyền truy cập**: Học sinh chỉ xem bài học của khóa học đã đăng ký

## Use Cases

### Tạo nội dung bài học
1. Teacher tạo bài học mới trong khóa học
2. Thêm các bước học vào bài học
3. Sắp xếp thứ tự bài học hợp lý

### Quản lý nội dung
1. Cập nhật thông tin bài học
2. Thêm/xóa/sửa bước học
3. Sắp xếp lại thứ tự bài học

### Navigation học tập
1. Học sinh xem bài học hiện tại
2. Chuyển đến bài học tiếp theo/trước đó
3. Theo dõi tiến độ học tập

## Model Relationships

```prisma
model Lesson {
  id          String   @id @default(cuid())
  title       String
  description String?
  order       Int
  courseId    String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relationships
  course Course       @relation(fields: [courseId], references: [id])
  steps  LessonStep[]
}
```

## Access Control

### ADMIN
- Toàn quyền tạo, sửa, xóa bài học
- Xem thống kê toàn hệ thống
- Sắp xếp thứ tự bài học

### TEACHER
- Tạo, sửa bài học
- Sắp xếp thứ tự bài học
- Không thể xóa bài học có học sinh đang học

### STUDENT
- Xem bài học của khóa học đã đăng ký
- Navigation giữa các bài học
- Xem tiến độ học tập của mình
# LessonSteps API - Quản lý Bước học

## Tổng quan

Module LessonSteps quản lý các bước học trong từng bài học. Mỗi bước học có thể chứa 3 loại nội dung:
- **TEXT**: Nội dung văn bản (Markdown)
- **VIDEO**: Video học tập
- **H5P**: Nội dung tương tác H5P (quiz, games, presentations)

## Base URL
```
/lesson-steps
```

## Endpoints

### 1. Tạo bước học mới

**POST** `/lesson-steps`

**Quyền truy cập**: ADMIN, TEACHER

**Body request (TEXT)**:
```json
{
  "title": "Giới thiệu phép cộng",
  "description": "Bước đầu tiên để hiểu phép cộng",
  "contentType": "TEXT", 
  "textContent": "# Phép cộng là gì?\n\nPhép cộng là một phép toán cơ bản...",
  "lessonId": "lesson123...",
  "order": 1
}
```

**Body request (VIDEO)**:
```json
{
  "title": "Video hướng dẫn phép cộng",
  "description": "Video minh họa cách thực hiện phép cộng",
  "contentType": "VIDEO",
  "videoUrl": "https://youtube.com/watch?v=abc123",
  "lessonId": "lesson123...",
  "order": 2
}
```

**Body request (H5P)**:
```json
{
  "title": "Bài tập tương tác",
  "description": "Quiz kiểm tra hiểu biết về phép cộng",
  "contentType": "H5P",
  "h5pContentId": "h5p123...",
  "lessonId": "lesson123...",
  "order": 3
}
```

**Response thành công** (201):
```json
{
  "id": "step123...",
  "title": "Giới thiệu phép cộng",
  "description": "Bước đầu tiên để hiểu phép cộng",
  "order": 1,
  "contentType": "TEXT",
  "contentJson": {
    "text": "# Phép cộng là gì?\n\nPhép cộng là một phép toán cơ bản..."
  },
  "lessonId": "lesson123...",
  "h5pContentId": null,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "lesson": {
    "id": "lesson123...",
    "title": "Bài 1: Phép cộng trong phạm vi 10",
    "course": {
      "id": "course123...",
      "title": "Toán học Lớp 1",
      "class": {
        "id": "class123",
        "name": "Lớp 1A"
      }
    }
  }
}
```

**Validation rules**:
- `title`: Bắt buộc, tối đa 255 ký tự
- `contentType`: Bắt buộc, phải là TEXT/VIDEO/H5P
- `textContent`: Bắt buộc khi contentType = TEXT
- `videoUrl`: Bắt buộc khi contentType = VIDEO  
- `h5pContentId`: Bắt buộc khi contentType = H5P
- `lessonId`: Bắt buộc, phải tồn tại
- `order`: Tùy chọn, sẽ tự động tính nếu không có

### 2. Lấy tất cả bước học của một bài học

**GET** `/lesson-steps/lesson/{lessonId}`

**Response thành công** (200):
```json
[
  {
    "id": "step123...",
    "title": "Giới thiệu phép cộng",
    "order": 1,
    "contentType": "TEXT",
    "contentJson": {
      "text": "# Phép cộng là gì?\n\nPhép cộng là một phép toán cơ bản..."
    },
    "lessonId": "lesson123...",
    "h5pContentId": null,
    "h5pContent": null,
    "_count": {
      "studentProgress": 15
    }
  },
  {
    "id": "step456...",
    "title": "Video hướng dẫn",
    "order": 2,
    "contentType": "VIDEO",
    "contentJson": {
      "url": "https://youtube.com/watch?v=abc123"
    },
    "lessonId": "lesson123...",
    "h5pContentId": null,
    "h5pContent": null,
    "_count": {
      "studentProgress": 12
    }
  },
  {
    "id": "step789...",
    "title": "Bài tập tương tác",
    "order": 3,
    "contentType": "H5P",
    "contentJson": {
      "h5pContentId": "h5p123..."
    },
    "lessonId": "lesson123...",
    "h5pContentId": "h5p123...",
    "h5pContent": {
      "id": "h5p123...",
      "title": "Quiz phép cộng",
      "library": "H5P.MultiChoice"
    },
    "_count": {
      "studentProgress": 8
    }
  }
]
```

### 3. Lấy thông tin chi tiết bước học

**GET** `/lesson-steps/{id}`

**Response thành công** (200):
```json
{
  "id": "step789...",
  "title": "Bài tập tương tác",
  "order": 3,
  "contentType": "H5P",
  "contentJson": {
    "h5pContentId": "h5p123..."
  },
  "lessonId": "lesson123...",
  "h5pContentId": "h5p123...",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "lesson": {
    "id": "lesson123...",
    "title": "Bài 1: Phép cộng trong phạm vi 10",
    "course": {
      "id": "course123...",
      "title": "Toán học Lớp 1",
      "class": {
        "id": "class123",
        "name": "Lớp 1A",
        "gradeLevel": 1
      }
    }
  },
  "h5pContent": {
    "id": "h5p123...",
    "title": "Quiz phép cộng",
    "library": "H5P.MultiChoice",
    "params": {
      "question": "2 + 3 = ?",
      "answers": [
        { "text": "4", "correct": false },
        { "text": "5", "correct": true },
        { "text": "6", "correct": false }
      ]
    }
  },
  "_count": {
    "studentProgress": 8
  }
}
```

### 4. Cập nhật bước học

**PATCH** `/lesson-steps/{id}`

**Quyền truy cập**: ADMIN, TEACHER

**Body request**:
```json
{
  "title": "Bài tập tương tác - Cập nhật",
  "contentType": "TEXT",
  "textContent": "Nội dung văn bản mới..."
}
```

**Response thành công** (200):
```json
{
  "id": "step789...",
  "title": "Bài tập tương tác - Cập nhật",
  "order": 3,
  "contentType": "TEXT",
  "contentJson": {
    "text": "Nội dung văn bản mới..."
  },
  "h5pContentId": null,
  "updatedAt": "2024-01-15T11:30:00Z",
  "lesson": {
    "id": "lesson123...",
    "title": "Bài 1: Phép cộng trong phạm vi 10"
  }
}
```

### 5. Xóa bước học

**DELETE** `/lesson-steps/{id}`

**Quyền truy cập**: ADMIN, TEACHER

**Response thành công** (204): Không có nội dung

**Lưu ý**: Sẽ xóa tiến độ học tập liên quan và cập nhật lại thứ tự các bước còn lại

### 6. Sắp xếp lại thứ tự bước học

**POST** `/lesson-steps/lesson/{lessonId}/reorder`

**Quyền truy cập**: ADMIN, TEACHER

**Body request**:
```json
{
  "stepIds": ["step789", "step123", "step456"]
}
```

**Response thành công** (200):
```json
{
  "message": "Đã cập nhật thứ tự bước học thành công"
}
```

### 7. Sao chép bước học

**POST** `/lesson-steps/{id}/duplicate`

**Quyền truy cập**: ADMIN, TEACHER

**Response thành công** (201):
```json
{
  "id": "step999...",
  "title": "Bài tập tương tác (Bản sao)",
  "order": 4,
  "contentType": "H5P",
  "contentJson": {
    "h5pContentId": "h5p123..."
  },
  "lessonId": "lesson123...",
  "h5pContentId": "h5p123...",
  "createdAt": "2024-01-15T14:00:00Z",
  "lesson": {
    "id": "lesson123...",
    "title": "Bài 1: Phép cộng trong phạm vi 10"
  },
  "h5pContent": {
    "id": "h5p123...",
    "title": "Quiz phép cộng",
    "library": "H5P.MultiChoice"
  }
}
```

### 8. Tìm kiếm bước học

**GET** `/lesson-steps/search?lessonId={id}&searchTerm={term}`

**Query parameters**:
- `lessonId`: Lọc theo bài học (tùy chọn)
- `searchTerm`: Từ khóa tìm kiếm (tùy chọn)

**Response thành công** (200):
```json
[
  {
    "id": "step123...",
    "title": "Giới thiệu phép cộng",
    "order": 1,
    "contentType": "TEXT",
    "lesson": {
      "id": "lesson123...",
      "title": "Bài 1: Phép cộng trong phạm vi 10",
      "course": {
        "id": "course123...",
        "title": "Toán học Lớp 1",
        "class": {
          "id": "class123",
          "name": "Lớp 1A",
          "gradeLevel": 1
        }
      }
    },
    "h5pContent": null,
    "_count": {
      "studentProgress": 15
    }
  }
]
```

### 9. Thống kê bước học

**GET** `/lesson-steps/statistics?lessonId={id}`

**Query parameters**:
- `lessonId`: ID bài học cụ thể (tùy chọn)

**Response thành công** (200):
```json
{
  "totalSteps": 450,
  "stepsByType": {
    "TEXT": 180,
    "VIDEO": 135,
    "H5P": 135
  },
  "stepsWithProgress": 400,
  "stepsWithoutProgress": 50
}
```

## Content Types Chi tiết

### TEXT Content
```json
{
  "contentType": "TEXT",
  "contentJson": {
    "text": "# Tiêu đề\n\n**Nội dung** markdown đầy đủ...\n\n- Danh sách\n- Các mục"
  }
}
```

### VIDEO Content
```json
{
  "contentType": "VIDEO", 
  "contentJson": {
    "url": "https://youtube.com/watch?v=abc123",
    "duration": 300,
    "thumbnail": "https://img.youtube.com/vi/abc123/maxresdefault.jpg"
  }
}
```

### H5P Content
```json
{
  "contentType": "H5P",
  "contentJson": {
    "h5pContentId": "h5p123..."
  },
  "h5pContentId": "h5p123...",
  "h5pContent": {
    "id": "h5p123...",
    "title": "Quiz phép cộng",
    "library": "H5P.MultiChoice",
    "params": { /* H5P parameters */ }
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": [
    "Tiêu đề bước học không được để trống",
    "Nội dung văn bản không được để trống khi loại bước học là TEXT"
  ],
  "error": "Bad Request"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy bước học",
  "error": "Not Found"
}
```

## Business Rules

1. **Content validation**: Mỗi loại nội dung có validation riêng
2. **H5P integration**: Bước học H5P phải liên kết với nội dung H5P hợp lệ
3. **Order management**: Thứ tự bước học được quản lý tự động
4. **Progress tracking**: Mỗi bước học có thể theo dõi tiến độ học sinh

## Use Cases

### Tạo nội dung đa phương tiện
1. Teacher tạo bước học văn bản giới thiệu
2. Thêm video hướng dẫn
3. Tạo bài tập tương tác H5P

### Quản lý nội dung học tập
1. Cập nhật nội dung bước học
2. Thay đổi loại nội dung
3. Sắp xếp lại thứ tự bước học

### Theo dõi tiến độ
1. Xem số lượng học sinh đã hoàn thành
2. Phân tích hiệu quả từng loại nội dung

## Model Relationships

```prisma
model LessonStep {
  id           String         @id @default(cuid())
  title        String
  order        Int
  contentType  LessonStepType
  contentJson  Json?
  lessonId     String
  h5pContentId String?

  // Relationships  
  lesson          Lesson            @relation(fields: [lessonId], references: [id])
  h5pContent      H5PContent?       @relation(fields: [h5pContentId], references: [id])
  studentProgress StudentProgress[]
}

enum LessonStepType {
  TEXT
  VIDEO  
  H5P
}
```
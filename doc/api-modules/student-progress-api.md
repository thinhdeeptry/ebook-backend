# StudentProgress API - Theo dõi Tiến độ học tập

## Tổng quan

Module StudentProgress theo dõi tiến độ học tập của từng học sinh trên từng bước học. Hệ thống ghi nhận trạng thái hoàn thành, lịch sử làm quiz, và thống kê tổng quan để giúp giáo viên và học sinh theo dõi quá trình học tập.

## Base URL
```
/student-progress
```

## Progress Status

- **NOT_STARTED**: Chưa bắt đầu
- **IN_PROGRESS**: Đang học
- **COMPLETED**: Đã hoàn thành

## Endpoints

### 1. Tạo/Cập nhật tiến độ học tập

**POST** `/student-progress`

**Quyền truy cập**: Tất cả (ADMIN/TEACHER có thể tạo cho học sinh khác)

**Body request**:
```json
{
  "userId": "user123...",
  "lessonStepId": "step123...",
  "status": "IN_PROGRESS"
}
```

**Response thành công** (201):
```json
{
  "id": "progress123...",
  "userId": "user123...",
  "lessonStepId": "step123...",
  "status": "IN_PROGRESS",
  "completedAt": null,
  "lastAccessed": "2024-01-15T10:30:00Z",
  "user": {
    "id": "user123...",
    "firstName": "Nguyễn Văn",
    "lastName": "An",
    "email": "an.nguyen@email.com"
  },
  "lessonStep": {
    "id": "step123...",
    "title": "Giới thiệu phép cộng",
    "contentType": "TEXT",
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
}
```

### 2. Lấy tiến độ của một học sinh

**GET** `/student-progress/user/{userId}`

**Quyền truy cập**: 
- ADMIN/TEACHER: Xem tất cả
- STUDENT: Chỉ xem tiến độ của mình

**Response thành công** (200):
```json
[
  {
    "id": "progress123...",
    "userId": "user123...",
    "lessonStepId": "step123...",
    "status": "COMPLETED",
    "completedAt": "2024-01-15T11:00:00Z",
    "lastAccessed": "2024-01-15T11:00:00Z",
    "lessonStep": {
      "id": "step123...",
      "title": "Giới thiệu phép cộng",
      "contentType": "TEXT",
      "order": 1,
      "lesson": {
        "id": "lesson123...",
        "title": "Bài 1: Phép cộng trong phạm vi 10",
        "order": 1,
        "course": {
          "id": "course123...",
          "title": "Toán học Lớp 1",
          "class": {
            "id": "class123",
            "name": "Lớp 1A"
          }
        }
      }
    },
    "quizAttempts": [
      {
        "id": "attempt123",
        "attemptNumber": 1,
        "score": 85.5,
        "isPass": true,
        "submittedAt": "2024-01-15T10:45:00Z"
      }
    ]
  }
]
```

### 3. Lấy tiến độ của học sinh hiện tại

**GET** `/student-progress/my-progress`

**Quyền truy cập**: Tất cả người dùng đã đăng nhập

**Response**: Tương tự endpoint trên nhưng chỉ trả về tiến độ của người dùng hiện tại

### 4. Cập nhật tiến độ

**PATCH** `/student-progress/{id}`

**Body request**:
```json
{
  "status": "COMPLETED"
}
```

**Response thành công** (200):
```json
{
  "id": "progress123...",
  "status": "COMPLETED",
  "completedAt": "2024-01-15T12:00:00Z",
  "lastAccessed": "2024-01-15T12:00:00Z",
  "lessonStep": {
    "id": "step123...",
    "title": "Giới thiệu phép cộng",
    "contentType": "TEXT"
  }
}
```

### 5. Lấy tiến độ theo bài học

**GET** `/student-progress/lesson/{lessonId}`

**Quyền truy cập**: 
- ADMIN/TEACHER: Xem tất cả học sinh
- STUDENT: Chỉ xem tiến độ của mình

**Response thành công** (200):
```json
[
  {
    "id": "progress123...",
    "status": "COMPLETED",
    "completedAt": "2024-01-15T11:00:00Z",
    "lastAccessed": "2024-01-15T11:00:00Z",
    "user": {
      "id": "user123...",
      "firstName": "Nguyễn Văn",
      "lastName": "An",
      "email": "an.nguyen@email.com"
    },
    "lessonStep": {
      "id": "step123...",
      "title": "Giới thiệu phép cộng",
      "order": 1,
      "contentType": "TEXT"
    },
    "quizAttempts": [
      {
        "id": "attempt123",
        "attemptNumber": 1,
        "score": 85.5,
        "isPass": true,
        "submittedAt": "2024-01-15T10:45:00Z"
      }
    ]
  }
]
```

### 6. Thống kê tiến độ tổng quan

**GET** `/student-progress/summary?userId={id}&classId={id}&courseId={id}&lessonId={id}`

**Query parameters**:
- `userId`: Lọc theo học sinh cụ thể
- `classId`: Lọc theo lớp học
- `courseId`: Lọc theo khóa học  
- `lessonId`: Lọc theo bài học

**Response thành công** (200):
```json
{
  "totalProgress": 150,
  "progressByStatus": {
    "NOT_STARTED": 20,
    "IN_PROGRESS": 45,
    "COMPLETED": 85
  },
  "completionRate": 56.67
}
```

### 7. Xóa tiến độ (Chỉ ADMIN)

**DELETE** `/student-progress/{id}`

**Quyền truy cập**: ADMIN

**Response thành công** (204): Không có nội dung

## Quiz Attempts Endpoints

### 8. Tạo lần thử quiz

**POST** `/student-progress/quiz-attempt`

**Body request**:
```json
{
  "studentProgressId": "progress123...",
  "score": 85.5,
  "isPass": true,
  "statement": {
    "actor": { "name": "Nguyễn Văn An" },
    "verb": { "display": { "en-US": "completed" } },
    "object": { "definition": { "name": { "en-US": "Quiz phép cộng" } } },
    "result": { "score": { "scaled": 0.855 }, "completion": true, "success": true }
  }
}
```

**Response thành công** (201):
```json
{
  "id": "attempt123...",
  "studentProgressId": "progress123...",
  "attemptNumber": 1,
  "score": 85.5,
  "isPass": true,
  "statement": { /* xAPI statement */ },
  "submittedAt": "2024-01-15T10:45:00Z",
  "studentProgress": {
    "id": "progress123...",
    "status": "COMPLETED",
    "user": {
      "id": "user123...",
      "firstName": "Nguyễn Văn",
      "lastName": "An"
    },
    "lessonStep": {
      "id": "step123...",
      "title": "Bài tập tương tác"
    }
  }
}
```

### 9. Lấy lịch sử quiz attempts

**GET** `/student-progress/{progressId}/quiz-attempts`

**Response thành công** (200):
```json
[
  {
    "id": "attempt123...",
    "attemptNumber": 1,
    "score": 75.0,
    "isPass": false,
    "statement": { /* xAPI statement */ },
    "submittedAt": "2024-01-15T10:30:00Z",
    "studentProgress": {
      "lessonStep": {
        "id": "step123...",
        "title": "Bài tập tương tác",
        "contentType": "H5P"
      }
    }
  },
  {
    "id": "attempt456...",
    "attemptNumber": 2,
    "score": 85.5,
    "isPass": true,
    "statement": { /* xAPI statement */ },
    "submittedAt": "2024-01-15T10:45:00Z",
    "studentProgress": {
      "lessonStep": {
        "id": "step123...",
        "title": "Bài tập tương tác",
        "contentType": "H5P"
      }
    }
  }
]
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": [
    "ID người dùng không được để trống",
    "Trạng thái tiến độ phải là NOT_STARTED, IN_PROGRESS, hoặc COMPLETED"
  ],
  "error": "Bad Request"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Bạn không có quyền tạo tiến độ cho người dùng khác",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy tiến độ học tập",
  "error": "Not Found"
}
```

## Business Rules

1. **Unique constraint**: Mỗi học sinh chỉ có một tiến độ cho mỗi bước học
2. **Class membership**: Học sinh phải thuộc lớp học của khóa học mới có thể có tiến độ
3. **Auto-completion**: Khi status = COMPLETED, tự động set completedAt
4. **Quiz attempts**: Mỗi lần thử có số thứ tự tăng dần

## Advanced Features

### Progress Analytics
```javascript
// Tính tỷ lệ hoàn thành theo thời gian
GET /student-progress/analytics/completion-rate?period=weekly

// So sánh tiến độ giữa các lớp
GET /student-progress/analytics/class-comparison

// Phân tích hiệu quả loại nội dung
GET /student-progress/analytics/content-effectiveness
```

### Learning Path Recommendations
```javascript
// Gợi ý bước học tiếp theo
GET /student-progress/recommendations/next-steps?userId={id}

// Gợi ý ôn tập
GET /student-progress/recommendations/review?userId={id}
```

## Use Cases

### Theo dõi cá nhân
1. Học sinh xem tiến độ học tập của mình
2. Xem lịch sử làm quiz và điểm số
3. Nhận gợi ý bước học tiếp theo

### Giám sát lớp học
1. Giáo viên xem tổng quan tiến độ lớp
2. Xác định học sinh cần hỗ trợ
3. Phân tích hiệu quả bài học

### Báo cáo quản lý
1. Admin xem thống kê toàn trường
2. So sánh tiến độ giữa các lớp
3. Đánh giá hiệu quả chương trình học

## Model Relationships

```prisma
model StudentProgress {
  id           String         @id @default(cuid())
  userId       String
  lessonStepId String
  status       ProgressStatus @default(NOT_STARTED)
  completedAt  DateTime?
  lastAccessed DateTime       @updatedAt

  // Relationships
  user         User          @relation(fields: [userId], references: [id])
  lessonStep   LessonStep    @relation(fields: [lessonStepId], references: [id])
  quizAttempts QuizAttempt[]

  @@unique([userId, lessonStepId])
}

model QuizAttempt {
  id                String   @id @default(cuid())
  studentProgressId String
  attemptNumber     Int
  score             Float?
  isPass            Boolean
  statement         Json?
  submittedAt       DateTime @default(now())

  // Relationships
  studentProgress StudentProgress @relation(fields: [studentProgressId], references: [id])
}
```

## Integration với H5P

Khi học sinh tương tác với nội dung H5P:

1. **xAPI Events**: H5P gửi xAPI statements về progress
2. **Auto Progress**: Hệ thống tự động cập nhật StudentProgress
3. **Quiz Tracking**: Tạo QuizAttempt cho mỗi lần submit H5P
4. **Score Calculation**: Tính điểm dựa trên kết quả H5P

```javascript
// Workflow tự động
H5P Content → xAPI Statement → StudentProgress Update → QuizAttempt Creation
```
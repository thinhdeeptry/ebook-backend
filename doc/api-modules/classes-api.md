# Classes API - Quản lý Lớp học

## Tổng quan

Module Classes quản lý các lớp học trong hệ thống giáo dục (Lớp 1, Lớp 2, Lớp 3, Lớp 4, Lớp 5). Mỗi lớp học có thể chứa nhiều khóa học (môn học) và có thể có nhiều học sinh ghi danh.

## Base URL
```
/classes
```

## Endpoints

### 1. Tạo lớp học mới

**POST** `/classes`

**Quyền truy cập**: ADMIN, TEACHER

**Body request**:
```json
{
  "name": "Lớp 1A",
  "gradeLevel": 1,
  "description": "Lớp 1A năm học 2024-2025"
}
```

**Response thành công** (201):
```json
{
  "id": "cm123...",
  "name": "Lớp 1A", 
  "gradeLevel": 1,
  "description": "Lớp 1A năm học 2024-2025",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Validation rules**:
- `name`: Bắt buộc, tối đa 100 ký tự
- `gradeLevel`: Bắt buộc, số nguyên từ 1-5, duy nhất
- `description`: Tùy chọn

### 2. Lấy danh sách tất cả lớp học

**GET** `/classes`

**Quyền truy cập**: Tất cả người dùng đã đăng nhập

**Response thành công** (200):
```json
[
  {
    "id": "cm123...",
    "name": "Lớp 1A",
    "gradeLevel": 1,
    "description": "Lớp 1A năm học 2024-2025",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "_count": {
      "memberships": 25,
      "courses": 8
    }
  }
]
```

### 3. Lấy thông tin chi tiết lớp học

**GET** `/classes/{id}`

**Quyền truy cập**: Tất cả người dùng đã đăng nhập

**Response thành công** (200):
```json
{
  "id": "cm123...",
  "name": "Lớp 1A",
  "gradeLevel": 1,
  "description": "Lớp 1A năm học 2024-2025",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "memberships": [
    {
      "id": "cm456...",
      "joinedAt": "2024-01-16T08:00:00Z",
      "user": {
        "id": "user123",
        "firstName": "Nguyễn Văn",
        "lastName": "An",
        "email": "an.nguyen@email.com"
      }
    }
  ],
  "courses": [
    {
      "id": "course123",
      "title": "Toán học Lớp 1",
      "isPublished": true,
      "_count": {
        "lessons": 20
      }
    }
  ],
  "_count": {
    "memberships": 25,
    "courses": 8
  }
}
```

### 4. Cập nhật thông tin lớp học

**PATCH** `/classes/{id}`

**Quyền truy cập**: ADMIN, TEACHER

**Body request**:
```json
{
  "name": "Lớp 1A - Cập nhật",
  "description": "Mô tả mới"
}
```

**Response thành công** (200):
```json
{
  "id": "cm123...",
  "name": "Lớp 1A - Cập nhật",
  "gradeLevel": 1,
  "description": "Mô tả mới",
  "updatedAt": "2024-01-15T11:30:00Z"
}
```

### 5. Xóa lớp học

**DELETE** `/classes/{id}`

**Quyền truy cập**: ADMIN

**Response thành công** (204): Không có nội dung

**Lưu ý**: Sẽ xóa toàn bộ dữ liệu liên quan (courses, lessons, memberships)

### 6. Thêm học sinh vào lớp

**POST** `/classes/{id}/students`

**Quyền truy cập**: ADMIN, TEACHER

**Body request**:
```json
{
  "userIds": ["user123", "user456", "user789"]
}
```

**Response thành công** (201):
```json
{
  "message": "Đã thêm 3 học sinh vào lớp thành công",
  "added": 3,
  "skipped": 0,
  "details": [
    {
      "userId": "user123",
      "status": "added",
      "user": {
        "firstName": "Nguyễn Văn",
        "lastName": "An"
      }
    }
  ]
}
```

### 7. Xóa học sinh khỏi lớp

**DELETE** `/classes/{id}/students/{userId}`

**Quyền truy cập**: ADMIN, TEACHER

**Response thành công** (200):
```json
{
  "message": "Đã xóa học sinh khỏi lớp thành công"
}
```

### 8. Lấy danh sách học sinh trong lớp

**GET** `/classes/{id}/students`

**Quyền truy cập**: ADMIN, TEACHER

**Response thành công** (200):
```json
[
  {
    "id": "membership123",
    "joinedAt": "2024-01-16T08:00:00Z",
    "user": {
      "id": "user123",
      "firstName": "Nguyễn Văn",
      "lastName": "An",
      "email": "an.nguyen@email.com",
      "isActive": true
    }
  }
]
```

### 9. Tìm kiếm lớp học

**GET** `/classes/search?searchTerm={term}&gradeLevel={level}`

**Query parameters**:
- `searchTerm`: Từ khóa tìm kiếm (tên lớp, mô tả)
- `gradeLevel`: Lọc theo khối lớp (1-5)

**Response thành công** (200):
```json
[
  {
    "id": "cm123...",
    "name": "Lớp 1A",
    "gradeLevel": 1,
    "description": "Lớp 1A năm học 2024-2025",
    "_count": {
      "memberships": 25,
      "courses": 8
    }
  }
]
```

### 10. Thống kê lớp học

**GET** `/classes/statistics?classId={id}`

**Query parameters**:
- `classId`: ID lớp học cụ thể (tùy chọn)

**Response thành công** (200):
```json
{
  "totalClasses": 15,
  "classesByGrade": {
    "1": 3,
    "2": 3,
    "3": 3,
    "4": 3,
    "5": 3
  },
  "totalStudents": 375,
  "avgStudentsPerClass": 25,
  "totalCourses": 120,
  "avgCoursesPerClass": 8
}
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": [
    "Tên lớp học không được để trống",
    "Khối lớp phải là số từ 1 đến 5"
  ],
  "error": "Bad Request"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy lớp học",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Khối lớp này đã tồn tại",
  "error": "Conflict"
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

1. **Khối lớp duy nhất**: Mỗi khối lớp (1-5) chỉ có thể có một lớp học
2. **Học sinh không trùng lặp**: Một học sinh chỉ có thể thuộc một lớp học
3. **Cascade delete**: Xóa lớp học sẽ xóa toàn bộ khóa học và bài học liên quan
4. **Quyền truy cập**: Học sinh chỉ có thể xem thông tin lớp mình tham gia

## Use Cases

### Thiết lập năm học mới
1. Admin tạo 5 lớp học (Lớp 1 → Lớp 5)
2. Thêm học sinh vào từng lớp
3. Tạo các khóa học (môn học) cho mỗi lớp

### Quản lý học sinh
1. Teacher xem danh sách học sinh trong lớp
2. Thêm học sinh mới chuyển lớp
3. Xóa học sinh chuyển trường

### Báo cáo thống kê
1. Admin xem tổng quan toàn trường
2. Teacher xem thống kê lớp mình phụ trách

## Model Relationships

```prisma
model Class {
  id          String   @id @default(cuid())
  name        String
  gradeLevel  Int      @unique
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relationships
  memberships ClassMembership[]
  courses     Course[]
}

model ClassMembership {
  id       String   @id @default(cuid())
  userId   String
  classId  String
  joinedAt DateTime @default(now())

  user  User  @relation(fields: [userId], references: [id])
  class Class @relation(fields: [classId], references: [id])

  @@unique([userId, classId])
}
```
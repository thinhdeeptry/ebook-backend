# H5P Integration - Tích hợp Nội dung Tương tác

## Tổng quan

Module H5P đã được mở rộng để tích hợp hoàn toàn với hệ thống quản lý giáo dục. Nội dung H5P có thể được liên kết trực tiếp với các bước học (LessonSteps) và theo dõi tiến độ học sinh qua xAPI events.

## Các cải tiến chính

### 1. Liên kết với LessonStep
- H5P content có thể được gán cho bước học cụ thể
- Trường `lessonStepId` trong CreateH5PContentDto
- Trường `isPublic` để kiểm soát quyền truy cập

### 2. Quản lý quyền truy cập
- Nội dung công khai: Tất cả có thể truy cập
- Nội dung riêng tư: Chỉ học sinh trong lớp học liên quan

### 3. Theo dõi xAPI
- Ghi nhận tất cả xAPI events từ H5P
- Tự động cập nhật StudentProgress
- Tạo QuizAttempt cho các hoạt động đánh giá

## Base URL
```
/h5p
```

## Endpoints mới

### 1. Upload H5P với liên kết bước học

**POST** `/h5p/upload`

**Body request (multipart/form-data)**:
```
file: [H5P package file]
lessonStepId: "step123..." (optional)
isPublic: true (optional, default: false)
```

**Response thành công** (201):
```json
{
  "id": "h5p123...",
  "title": "Quiz Toán học Lớp 1",
  "library": "H5P.MultiChoice 1.16",
  "params": { /* H5P parameters */ },
  "metadata": { /* H5P metadata */ },
  "filePath": "/uploads/h5p/content/h5p123.../content.json",
  "uploaderId": "user123...",
  "isPublic": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "uploader": {
    "id": "user123...",
    "firstName": "Nguyễn",
    "lastName": "Giáo viên",
    "email": "teacher@school.edu.vn"
  }
}
```

### 2. Lấy H5P theo bước học

**GET** `/h5p/lesson-step/{lessonStepId}`

**Response thành công** (200):
```json
[
  {
    "id": "h5p123...",
    "title": "Quiz Toán học Lớp 1", 
    "library": "H5P.MultiChoice 1.16",
    "params": { /* H5P parameters */ },
    "isPublic": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "uploader": {
      "firstName": "Nguyễn",
      "lastName": "Giáo viên"
    }
  }
]
```

### 3. Lấy H5P công khai

**GET** `/h5p/public`

**Response thành công** (200):
```json
[
  {
    "id": "h5p123...",
    "title": "Quiz Toán học Lớp 1",
    "library": "H5P.MultiChoice 1.16", 
    "metadata": {
      "title": "Quiz Toán học Lớp 1",
      "authors": [{"name": "Nguyễn Giáo viên"}],
      "license": "CC BY-SA"
    },
    "isPublic": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

### 4. Gán H5P cho bước học

**POST** `/h5p/{id}/assign-to-step`

**Quyền truy cập**: ADMIN, TEACHER

**Body request**:
```json
{
  "lessonStepId": "step123..."
}
```

**Response thành công** (200):
```json
{
  "message": "Đã gán nội dung H5P cho bước học thành công",
  "h5pContent": {
    "id": "h5p123...",
    "title": "Quiz Toán học Lớp 1"
  },
  "lessonStep": {
    "id": "step123...",
    "title": "Bài tập tương tác",
    "lesson": {
      "title": "Bài 1: Phép cộng trong phạm vi 10"
    }
  }
}
```

### 5. Hủy gán H5P khỏi bước học

**POST** `/h5p/{id}/unassign-from-step`

**Quyền truy cập**: ADMIN, TEACHER

**Response thành công** (200):
```json
{
  "message": "Đã hủy gán nội dung H5P khỏi bước học thành công"
}
```

## xAPI Integration

### xAPI Statement Format

Khi học sinh tương tác với nội dung H5P, hệ thống nhận và xử lý các xAPI statements:

```json
{
  "actor": {
    "name": "Nguyễn Văn An",
    "account": {
      "name": "user123...",
      "homePage": "https://school.edu.vn"
    }
  },
  "verb": {
    "id": "http://adlnet.gov/expapi/verbs/completed",
    "display": {
      "en-US": "completed",
      "vi-VN": "đã hoàn thành"
    }
  },
  "object": {
    "id": "https://school.edu.vn/h5p/h5p123...",
    "definition": {
      "name": {
        "en-US": "Addition Quiz",
        "vi-VN": "Quiz Phép cộng"
      },
      "type": "http://adlnet.gov/expapi/activities/assessment"
    }
  },
  "result": {
    "score": {
      "scaled": 0.85,
      "raw": 85,
      "min": 0,
      "max": 100
    },
    "completion": true,
    "success": true,
    "duration": "PT2M30S"
  },
  "context": {
    "contextActivities": {
      "parent": [{
        "id": "https://school.edu.vn/lesson-steps/step123...",
        "definition": {
          "name": {
            "vi-VN": "Bài tập tương tác"
          }
        }
      }]
    }
  },
  "timestamp": "2024-01-15T10:45:30Z"
}
```

### Auto Progress Update

Khi nhận xAPI statement, hệ thống tự động:

1. **Cập nhật StudentProgress**: Chuyển status sang COMPLETED nếu success = true
2. **Tạo QuizAttempt**: Ghi lại điểm số và kết quả
3. **Trigger Events**: Gửi notification đến giáo viên (nếu cần)

```javascript
// Workflow tự động
H5P Interaction → xAPI Statement → Progress Update → Quiz Attempt → Notification
```

## DTOs được mở rộng

### CreateH5PContentDto
```typescript
export class CreateH5PContentDto {
  title?: string; // Optional, sẽ lấy từ H5P metadata
  
  @IsOptional()
  @IsString({ message: 'ID bước học phải là chuỗi ký tự' })
  lessonStepId?: string;
  
  @IsOptional()
  @IsBoolean({ message: 'Trạng thái công khai phải là true hoặc false' })
  isPublic?: boolean;
}
```

### UpdateH5PContentDto
```typescript
export class UpdateH5PContentDto {
  @IsOptional()
  title?: string;
  
  @IsOptional()
  @IsString({ message: 'ID bước học phải là chuỗi ký tự' })
  lessonStepId?: string;
  
  @IsOptional()
  @IsBoolean({ message: 'Trạng thái công khai phải là true hoặc false' })
  isPublic?: boolean;
}
```

## Content Management

### Quyền truy cập H5P

#### ADMIN
- Upload, chỉnh sửa, xóa tất cả nội dung H5P
- Gán/hủy gán H5P cho bất kỳ bước học nào
- Xem tất cả thống kê và reports

#### TEACHER
- Upload và quản lý nội dung H5P của mình
- Gán H5P cho bước học trong lớp mình phụ trách
- Xem thống kê lớp học của mình

#### STUDENT
- Truy cập H5P công khai
- Truy cập H5P trong bước học của lớp mình tham gia
- Tương tác và gửi xAPI statements

### Content Lifecycle

1. **Upload**: Teacher upload H5P package
2. **Assignment**: Gán H5P cho bước học cụ thể
3. **Access Control**: Kiểm tra quyền truy cập dựa trên class membership
4. **Interaction**: Student tương tác với H5P
5. **Tracking**: Ghi nhận xAPI events và cập nhật progress
6. **Analytics**: Phân tích dữ liệu học tập

## Library Management

H5P libraries được quản lý tự động:

- **Auto Installation**: Tự động cài đặt libraries từ H5P packages
- **Dependency Resolution**: Xử lý dependencies giữa libraries
- **Version Control**: Quản lý multiple versions của cùng một library
- **Public Registry**: Tích hợp với H5P Hub (tùy chọn)

## Storage Structure

```
uploads/h5p/
├── content/
│   ├── {contentId}/
│   │   ├── content.json          # H5P parameters
│   │   ├── h5p.json              # H5P metadata  
│   │   └── content/              # Content files (images, videos, etc.)
│   └── ...
├── libraries/
│   ├── H5P.MultiChoice-1.16/
│   │   ├── library.json          # Library definition
│   │   ├── semantics.json        # Form structure
│   │   └── *.js, *.css          # Library files
│   └── ...
├── temp/                        # Temporary upload files
└── work/                        # Working directory for package processing
```

## Performance Optimizations

### Caching Strategy
```javascript
// H5P content caching
Cache-Control: public, max-age=3600
ETag: "h5p-content-{contentId}-{updatedAt}"

// Library files caching  
Cache-Control: public, max-age=86400
ETag: "h5p-library-{machineName}-{version}"
```

### Database Indexing
```sql
-- Tối ưu queries cho H5P
CREATE INDEX idx_h5p_content_public ON h5p_contents(is_public);
CREATE INDEX idx_h5p_content_uploader ON h5p_contents(uploader_id);
CREATE INDEX idx_lesson_step_h5p ON lesson_steps(h5p_content_id);
```

## Error Handling

### H5P Validation Errors
```json
{
  "statusCode": 400,
  "message": "H5P package không hợp lệ: Thiếu file h5p.json",
  "error": "Bad Request",
  "details": {
    "type": "H5P_VALIDATION_ERROR",
    "missingFiles": ["h5p.json"],
    "invalidLibraries": []
  }
}
```

### Access Control Errors
```json
{
  "statusCode": 403,
  "message": "Bạn không có quyền truy cập nội dung H5P này",
  "error": "Forbidden",
  "details": {
    "reason": "CONTENT_NOT_PUBLIC",
    "requiredMembership": "class123"
  }
}
```

## Integration Examples

### Embedding H5P trong LessonStep
```html
<!-- Frontend integration -->
<div class="lesson-step-content">
  <h3>{{ lessonStep.title }}</h3>
  
  <div v-if="lessonStep.contentType === 'H5P'" class="h5p-container">
    <iframe 
      :src="`/h5p/${lessonStep.h5pContentId}/embed`"
      width="100%" 
      height="500"
      frameborder="0"
      allowfullscreen>
    </iframe>
  </div>
</div>
```

### xAPI Event Handling
```javascript
// Frontend xAPI listener
H5P.externalDispatcher.on('xAPI', function(event) {
  // Gửi xAPI statement về backend
  fetch('/h5p/xapi', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    },
    body: JSON.stringify(event.data.statement)
  });
});
```

## Best Practices

1. **Content Organization**: Tổ chức H5P content theo cấu trúc lớp/khóa/bài học
2. **Performance**: Sử dụng CDN cho H5P libraries phổ biến
3. **Security**: Validate tất cả H5P packages trước khi upload
4. **Analytics**: Thu thập đủ dữ liệu xAPI để phân tích hiệu quả học tập
5. **Backup**: Định kỳ backup H5P content và libraries
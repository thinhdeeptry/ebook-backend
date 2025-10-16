# Hướng dẫn Test API với Postman - Hệ thống Quản lý Giáo dục

## Tổng quan

Collection này chứa tất cả các API endpoints để test hệ thống quản lý giáo dục, bao gồm:
- **Authentication**: Đăng ký, đăng nhập
- **Classes API**: Quản lý lớp học
- **Courses API**: Quản lý khóa học  
- **Lessons API**: Quản lý bài học
- **LessonSteps API**: Quản lý bước học
- **StudentProgress API**: Theo dõi tiến độ
- **H5P API**: Nội dung tương tác
- **Users API**: Quản lý người dùng

## Cài đặt

### 1. Import Collection và Environment

1. **Import Collection**:
   - Mở Postman
   - Click **Import**
   - Chọn file `education-system-postman-collection.json`

2. **Import Environment**:
   - Click **Import**  
   - Chọn file `education-system-environment.json`
   - Chọn environment "Education System - Environment"

### 2. Cấu hình Environment

Kiểm tra các biến environment:
- `base_url`: `http://localhost:3000` (hoặc URL server của bạn)
- `admin_email`: `admin@school.edu.vn`
- `admin_password`: `Admin123!`

## Luồng Test Chuẩn

### Bước 1: Authentication 🔐

1. **Đăng ký Admin**:
   ```
   POST /auth/register
   ```
   - Tạo tài khoản admin để test
   - Role: ADMIN

2. **Đăng nhập**:
   ```
   POST /auth/login
   ```
   - Sẽ tự động set `jwt_token` và `user_id`
   - Token được sử dụng cho tất cả requests tiếp theo

3. **Xem profile**:
   ```
   GET /auth/profile
   ```
   - Kiểm tra thông tin user đã đăng nhập

### Bước 2: Tạo cấu trúc học tập 🏫

**Classes → Courses → Lessons → LessonSteps**

#### 2.1. Tạo lớp học
```
POST /classes
Body:
{
  \"name\": \"Lớp 1A\",
  \"gradeLevel\": 1,
  \"description\": \"Lớp 1A năm học 2024-2025\"
}
```
- Sẽ tự động set `class_id`

#### 2.2. Tạo khóa học
```
POST /courses
Body:
{
  \"title\": \"Toán học Lớp 1\",
  \"classId\": \"{{class_id}}\"
}
```
- Sẽ tự động set `course_id`

#### 2.3. Tạo bài học
```
POST /lessons
Body:
{
  \"title\": \"Bài 1: Phép cộng trong phạm vi 10\",
  \"courseId\": \"{{course_id}}\"
}
```
- Sẽ tự động set `lesson_id`

#### 2.4. Tạo bước học
```
POST /lesson-steps
Body (TEXT):
{
  \"title\": \"Giới thiệu phép cộng\",
  \"contentType\": \"TEXT\",
  \"textContent\": \"# Phép cộng là gì?...\",
  \"lessonId\": \"{{lesson_id}}\"
}
```
- Sẽ tự động set `lesson_step_id`

### Bước 3: Test các chức năng CRUD 📝

#### 3.1. Đọc dữ liệu (Read)
- `GET /classes` - Xem tất cả lớp học
- `GET /classes/{{class_id}}` - Chi tiết lớp học
- `GET /courses/class/{{class_id}}` - Khóa học trong lớp
- `GET /lessons/course/{{course_id}}` - Bài học trong khóa

#### 3.2. Cập nhật (Update)
- `PATCH /classes/{{class_id}}` - Sửa lớp học
- `PATCH /courses/{{course_id}}` - Sửa khóa học
- `PATCH /lessons/{{lesson_id}}` - Sửa bài học

#### 3.3. Xóa (Delete)
- `DELETE /lesson-steps/{{lesson_step_id}}` - Xóa bước học
- `DELETE /lessons/{{lesson_id}}` - Xóa bài học
- `DELETE /classes/{{class_id}}` - Xóa lớp học (cuối cùng)

### Bước 4: Test tính năng nâng cao 🚀

#### 4.1. Quản lý học sinh
```
POST /classes/{{class_id}}/students
Body:
{
  \"userIds\": [\"{{user_id}}\"]
}
```

#### 4.2. Sắp xếp thứ tự
```
POST /lessons/course/{{course_id}}/reorder
Body:
{
  \"lessonIds\": [\"{{lesson_id}}\"]
}
```

#### 4.3. Sao chép nội dung
```
POST /courses/{{course_id}}/duplicate
Body:
{
  \"newTitle\": \"Toán học Lớp 1 (Bản sao)\",
  \"targetClassId\": \"{{class_id}}\"
}
```

### Bước 5: Test StudentProgress 📊

#### 5.1. Tạo tiến độ
```
POST /student-progress
Body:
{
  \"userId\": \"{{user_id}}\",
  \"lessonStepId\": \"{{lesson_step_id}}\",
  \"status\": \"IN_PROGRESS\"
}
```

#### 5.2. Cập nhật tiến độ
```
PATCH /student-progress/{{progress_id}}
Body:
{
  \"status\": \"COMPLETED\"
}
```

#### 5.3. Tạo quiz attempt
```
POST /student-progress/quiz-attempt
Body:
{
  \"studentProgressId\": \"{{progress_id}}\",
  \"score\": 85.5,
  \"isPass\": true
}
```

### Bước 6: Test H5P Integration 🎮

#### 6.1. Upload H5P (nếu có file)
```
POST /h5p/upload
Form Data:
- file: [chọn file .h5p]
- lessonStepId: {{lesson_step_id}}
- isPublic: true
```

#### 6.2. Test xAPI
```
POST /tracking/xapi
Body: [xAPI Statement JSON]
```

## Test Scenarios

### Scenario 1: Tạo lớp học hoàn chỉnh
1. Tạo lớp học
2. Tạo 3 khóa học (Toán, Văn, Anh)
3. Mỗi khóa học tạo 5 bài học
4. Mỗi bài học tạo 3 bước học (TEXT, VIDEO, H5P)

### Scenario 2: Test phân quyền
1. Tạo user với role TEACHER
2. Login với teacher account
3. Thử truy cập các endpoints
4. Kiểm tra response 403 Forbidden khi không có quyền

### Scenario 3: Test luồng học tập
1. Student đăng nhập
2. Xem danh sách lớp học của mình
3. Truy cập bài học
4. Tương tác với từng bước học
5. Cập nhật tiến độ

### Scenario 4: Test validation errors
1. Gửi request với dữ liệu không hợp lệ
2. Kiểm tra response validation messages bằng tiếng Việt
3. Test các edge cases

## API Endpoints Reference

### H5P Core Endpoints

```http
# System Status
GET /h5p/health                    # Health check
GET /h5p/integration               # Frontend integration config
GET /h5p/content-types            # Available H5P libraries
GET /h5p/libraries                # H5P library management

# Content Management  
GET /h5p/content                   # List user's content
POST /h5p/content                  # Create new content
PUT /h5p/content/:id              # Update content
DELETE /h5p/content/:id           # Delete content
GET /h5p/content/:id              # Get content for playing
GET /h5p/content/:id/edit         # Get content for editing

# Editor & Player
GET /h5p/editor                    # Editor integration
GET /h5p/player/:id               # Player integration

# File Operations
POST /h5p/files                    # Upload temporary files
GET /h5p/files/:id                # Download files
DELETE /h5p/files/:id             # Delete temporary files

# AJAX Operations
POST /h5p/ajax/setFinished         # Mark content completed
POST /h5p/ajax/contentUserData     # Save user interaction data
POST /h5p/ajax/:action            # Generic AJAX handler
```

### Role-Based Access

- **ADMIN**: Full access to all endpoints and content
- **TEACHER**: Create, edit, delete own content + view all
- **STUDENT**: View and interact with accessible content only

## Sample Request Bodies

### Create H5P Interactive Video

```json
{
  "library": "H5P.InteractiveVideo 1.26",
  "params": {
    "interactiveVideo": {
      "video": {
        "startScreenOptions": {
          "title": "Interactive Video Title",
          "hideStartTitle": false
        },
        "textTracks": {
          "videoTrack": [
            {
              "label": "Subtitles",
              "kind": "subtitles", 
              "srcLang": "en"
            }
          ]
        }
      },
      "assets": {
        "interactions": [],
        "bookmarks": []
      }
    }
  },
  "metadata": {
    "title": "Sample Interactive Video",
    "defaultLanguage": "en",
    "license": "U"
  }
}
```

### Submit H5P Completion

```json
{
  "contentId": "content_id_here",
  "score": 85,
  "maxScore": 100,
  "opened": 1696204800,
  "finished": 1696205700,
  "time": 900
}
```

### Save User Interaction Data

```json
{
  "contentId": "content_id_here", 
  "dataType": "state",
  "subContentId": 0,
  "data": "{\"progress\":75,\"currentSlide\":5,\"answers\":[\"option1\",\"option3\"]}"
}
```

## Authentication Flow

### 1. Login Request
```http
POST /auth/login
Content-Type: application/json

{
  "email": "teacher@example.com",
  "password": "teacher123"
}
```

### 2. Use JWT Token
```http
Authorization: Bearer {{accessToken}}
```

The token is automatically saved to environment variables for subsequent requests.

## Error Handling

### Common HTTP Status Codes

- `200`: Success
- `201`: Created successfully  
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

### Sample Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "library",
      "message": "Library is required"
    }
  ]
}
```

## Running Automated Tests

### Collection Runner
1. Click "Collections" → Select collection
2. Click "Run" → Configure test settings
3. Select environment and run tests

### Newman CLI
```bash
# Install Newman
npm install -g newman

# Run collection
newman run postman-collection.json \
  -e h5p-test-environment.json \
  --reporters cli,html \
  --reporter-html-export results.html
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Ensure valid credentials in environment
   - Check JWT token expiration
   - Verify user role permissions

2. **H5P Content Errors**
   - Validate H5P library format
   - Check content parameters structure
   - Ensure proper metadata

3. **File Upload Issues**
   - Verify file size limits
   - Check supported file types
   - Ensure temporary storage availability

### Debug Tips

1. **Enable Console Logging**
   - Check Postman console for detailed error messages
   - Review test script outputs

2. **Check Environment Variables**
   - Verify all required variables are set
   - Check auto-populated values after requests

3. **Server Logs**
   - Monitor backend logs for detailed error information
   - Check database connectivity

## Advanced Testing

### Custom Test Scripts

Add to request "Tests" tab:

```javascript
// Auto-save content ID
if (responseCode.code === 201) {
    const response = pm.response.json();
    if (response.data && response.data.id) {
        pm.environment.set('h5pContentId', response.data.id);
    }
}

// Validate response structure
pm.test("Response has success field", function () {
    pm.expect(pm.response.json()).to.have.property('success');
});

pm.test("Content ID is valid", function () {
    const contentId = pm.environment.get('h5pContentId');
    pm.expect(contentId).to.be.a('string');
    pm.expect(contentId.length).to.be.greaterThan(0);
});
```

### Data-Driven Testing

Use CSV/JSON files for bulk testing:

```csv
title,library,language
"Quiz 1","H5P.QuestionSet 1.20","en"
"Video 1","H5P.InteractiveVideo 1.26","en"
"Timeline 1","H5P.Timeline 1.1","en"
```

## Support

For issues or questions:
1. Check server logs and console output
2. Verify environment configuration  
3. Review API documentation
4. Test with simplified request bodies

## Biến Environment tự động

Các biến sau sẽ được set tự động khi test:

| Biến | Được set khi | Mục đích |
|------|-------------|----------|
| `jwt_token` | Login thành công | Authentication cho các requests |
| `user_id` | Login thành công | ID user hiện tại |
| `class_id` | Tạo lớp thành công | Test các API liên quan đến lớp |
| `course_id` | Tạo khóa học thành công | Test các API liên quan đến khóa học |
| `lesson_id` | Tạo bài học thành công | Test các API liên quan đến bài học |
| `lesson_step_id` | Tạo bước học thành công | Test các API liên quan đến bước học |
| `h5p_content_id` | Upload H5P thành công | Test H5P integration |
| `progress_id` | Tạo tiến độ thành công | Test progress tracking |

## Status Codes mong đợi

| Method | Endpoint | Success Code | Error Codes |
|--------|----------|-------------|-------------|
| POST | Create APIs | 201 Created | 400, 403, 409 |
| GET | Read APIs | 200 OK | 404, 403 |
| PATCH | Update APIs | 200 OK | 400, 403, 404 |
| DELETE | Delete APIs | 204 No Content | 403, 404 |

## Validation Messages

Tất cả validation errors sẽ trả về tiếng Việt:

```json
{
  \"statusCode\": 400,
  \"message\": [
    \"Tên lớp học không được để trống\",
    \"Khối lớp phải là số từ 1 đến 5\"
  ],
  \"error\": \"Bad Request\"
}
```

## Troubleshooting

### Lỗi thường gặp:

1. **401 Unauthorized**:
   - Chưa đăng nhập hoặc token hết hạn
   - Chạy lại \"Đăng nhập\" request

2. **404 Not Found**:
   - ID không tồn tại
   - Kiểm tra biến environment đã được set chưa

3. **403 Forbidden**:
   - Không có quyền truy cập
   - Kiểm tra role của user

4. **400 Bad Request**:
   - Dữ liệu không hợp lệ
   - Đọc message để biết lỗi cụ thể

### Debug tips:
- Kiểm tra Console của Postman để xem logs
- Xem tab Tests để kiểm tra assertions
- Verify environment variables trước khi chạy

## Tips sử dụng hiệu quả

1. **Chạy theo thứ tự**: Bắt đầu từ Authentication → Classes → Courses → ...
2. **Kiểm tra biến**: Đảm bảo các ID đã được set trước khi dùng
3. **Backup dữ liệu**: Lưu các ID quan trọng để test lại
4. **Test edge cases**: Thử với dữ liệu không hợp lệ
5. **Monitor database**: Kiểm tra database để verify kết quả

---

**Lưu ý**: Collection này được thiết kế để test đầy đủ tất cả chức năng của hệ thống. Hãy chạy server (`npm run start:dev`) trước khi test!
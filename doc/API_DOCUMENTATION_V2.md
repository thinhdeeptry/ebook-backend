# API Documentation - E-book Reader System (v2.0)

## 📋 Tổng quan

Backend API cho hệ thống E-book Reader được xây dựng với NestJS, hỗ trợ quản lý sách điện tử, nội dung tương tác H5P và theo dõi tiến độ học tập với cấu trúc phân cấp Book → Chapter → Lesson → Page → PageBlock.

**Base URL:** `http://localhost:3000`
**Authentication:** JWT Bearer Token
**Version:** 2.0.0 (After Database Refactoring)

## 🔄 Major Changes (v2.0)

### Database Structure Refactoring
- **Old**: Course → Lesson → LessonStep
- **New**: Book → Chapter → Lesson → Page → PageBlock

### API Endpoints Changes
- ❌ `/courses/*` endpoints removed
- ❌ `/lesson-steps/*` endpoints removed  
- ✅ `/books/*` endpoints added
- ✅ `/page-blocks/*` endpoints added
- 🔄 `/lessons/*` endpoints updated
- 🔄 `/student-progress/*` endpoints updated
- 🔄 `/h5p/*` endpoints updated

## 🔐 Authentication

### 1. Register User
```http
POST /auth/register
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "firstName": "Nguyễn",
  "lastName": "Văn An",
  "role": "STUDENT" // STUDENT | TEACHER | ADMIN
}
```

**Response:**
```json
{
  "message": "Đăng ký thành công",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "Nguyễn",
    "lastName": "Văn An",
    "role": "STUDENT",
    "isActive": true
  }
}
```

### 2. Login
```http
POST /auth/login
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "access_token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "Nguyễn",
    "lastName": "Văn An",
    "role": "STUDENT"
  }
}
```

### 3. Get Profile
```http
GET /auth/profile
Authorization: Bearer {jwt-token}
```

## 🏫 Classes API

### 1. Create Class
```http
POST /classes
Authorization: Bearer {jwt-token}
Roles: ADMIN, TEACHER
```

**Body:**
```json
{
  "name": "Lớp 1A",
  "gradeLevel": 1,
  "description": "Lớp 1A năm học 2024-2025"
}
```

### 2. Get All Classes
```http
GET /classes
Authorization: Bearer {jwt-token}
```

### 3. Get Class Details
```http
GET /classes/{classId}
Authorization: Bearer {jwt-token}
```

### 4. Get Class Books (Updated)
```http
GET /classes/{classId}/books
Authorization: Bearer {jwt-token}
```

**Response:**
```json
{
  "id": "class-id",
  "name": "Lớp 1A",
  "gradeLevel": 1,
  "books": [
    {
      "id": "book-id",
      "title": "Toán học Lớp 1",
      "subject": "Toán học",
      "grade": 1,
      "isPublished": true,
      "chapters": [
        {
          "id": "chapter-id",
          "title": "Chương 1: Đếm số",
          "order": 1,
          "_count": { "lessons": 5 }
        }
      ]
    }
  ]
}
```

### 5. Get Class Members
```http
GET /classes/{classId}/members
Authorization: Bearer {jwt-token}
Roles: ADMIN, TEACHER
```

### 6. Add Student to Class
```http
POST /classes/{classId}/students
Authorization: Bearer {jwt-token}
Roles: ADMIN, TEACHER
```

**Body:**
```json
{
  "userId": "student-user-id"
}
```

## 📚 Books API (New)

### 1. Create Book
```http
POST /books
Authorization: Bearer {jwt-token}
Roles: ADMIN, TEACHER
```

**Body:**
```json
{
  "title": "Toán học Lớp 1",
  "subject": "Toán học",
  "grade": 1,
  "description": "Sách giáo khoa Toán học dành cho học sinh lớp 1",
  "thumbnailUrl": "https://example.com/thumbnail.jpg",
  "isPublished": false,
  "classIds": ["class-id-1", "class-id-2"]
}
```

### 2. Get All Books
```http
GET /books?grade=1&subject=Toán học&isPublished=true
Authorization: Bearer {jwt-token}
```

**Query Parameters:**
- `grade` (optional): Filter by grade level
- `subject` (optional): Filter by subject
- `isPublished` (optional): Filter by published status
- `page` (optional): Page number for pagination
- `limit` (optional): Items per page

### 3. Get Book Details
```http
GET /books/{bookId}
Authorization: Bearer {jwt-token}
```

**Response:**
```json
{
  "id": "book-id",
  "title": "Toán học Lớp 1",
  "subject": "Toán học",
  "grade": 1,
  "description": "Sách giáo khoa Toán học...",
  "thumbnailUrl": "https://example.com/thumbnail.jpg",
  "isPublished": true,
  "createdAt": "2024-10-21T00:00:00Z",
  "chapters": [
    {
      "id": "chapter-id",
      "title": "Chương 1: Đếm số từ 1 đến 10",
      "order": 1,
      "description": "Học cách đếm số từ 1 đến 10",
      "_count": { "lessons": 3 }
    }
  ],
  "classes": [
    {
      "id": "class-id",
      "name": "Lớp 1A",
      "gradeLevel": 1
    }
  ]
}
```

### 4. Get Books by Class
```http
GET /books/class/{classId}
Authorization: Bearer {jwt-token}
```

### 5. Search Books
```http
GET /books/search?keyword=Toán&grade=1
Authorization: Bearer {jwt-token}
```

### 6. Update Book
```http
PUT /books/{bookId}
Authorization: Bearer {jwt-token}
Roles: ADMIN, TEACHER
```

### 7. Publish Book
```http
POST /books/{bookId}/publish
Authorization: Bearer {jwt-token}
Roles: ADMIN, TEACHER
```

## 📖 Lessons API (Updated)

### 1. Create Lesson
```http
POST /lessons
Authorization: Bearer {jwt-token}
Roles: ADMIN, TEACHER
```

**Body:**
```json
{
  "title": "Bài 1: Đếm từ 1 đến 5",
  "description": "Học cách đếm số từ 1 đến 5",
  "bookId": "book-id",
  "chapterId": "chapter-id",
  "order": 1
}
```

### 2. Get Lessons by Book
```http
GET /lessons/book/{bookId}
Authorization: Bearer {jwt-token}
```

### 3. Get Lessons by Chapter
```http
GET /lessons/chapter/{chapterId}
Authorization: Bearer {jwt-token}
```

### 4. Get Lesson Details
```http
GET /lessons/{lessonId}
Authorization: Bearer {jwt-token}
```

**Response:**
```json
{
  "id": "lesson-id",
  "title": "Bài 1: Đếm từ 1 đến 5",
  "description": "Học cách đếm số từ 1 đến 5",
  "order": 1,
  "book": {
    "id": "book-id",
    "title": "Toán học Lớp 1",
    "subject": "Toán học",
    "grade": 1
  },
  "chapter": {
    "id": "chapter-id",
    "title": "Chương 1: Đếm số",
    "order": 1
  },
  "pages": [
    {
      "id": "page-id",
      "title": "Trang 1: Giới thiệu",
      "order": 1,
      "_count": { "pageBlocks": 4 }
    }
  ]
}
```

### 5. Search Lessons
```http
GET /lessons/search?keyword=Đếm&bookId={bookId}&chapterId={chapterId}
Authorization: Bearer {jwt-token}
```

### 6. Update Lesson
```http
PUT /lessons/{lessonId}
Authorization: Bearer {jwt-token}
Roles: ADMIN, TEACHER
```

## 📄 Pages API (New)

### 1. Create Page
```http
POST /pages
Authorization: Bearer {jwt-token}
Roles: ADMIN, TEACHER
```

**Body:**
```json
{
  "title": "Trang 1: Giới thiệu số đếm",
  "lessonId": "lesson-id",
  "order": 1
}
```

### 2. Get Pages by Lesson
```http
GET /pages/lesson/{lessonId}
Authorization: Bearer {jwt-token}
```

### 3. Get Page Details
```http
GET /pages/{pageId}
Authorization: Bearer {jwt-token}
```

**Response:**
```json
{
  "id": "page-id",
  "title": "Trang 1: Giới thiệu số đếm",
  "order": 1,
  "lesson": {
    "id": "lesson-id",
    "title": "Bài 1: Đếm từ 1 đến 5"
  },
  "pageBlocks": [
    {
      "id": "block-id",
      "blockType": "TEXT",
      "order": 1,
      "contentJson": {
        "text": "# Số đếm là gì?\nSố đếm là...",
        "format": "markdown"
      }
    },
    {
      "id": "block-id-2",
      "blockType": "H5P",
      "order": 2,
      "h5pContentId": "h5p-content-id"
    }
  ]
}
```

## 🧩 PageBlocks API (New - replaces LessonSteps)

### 1. Create PageBlock
```http
POST /page-blocks
Authorization: Bearer {jwt-token}
Roles: ADMIN, TEACHER
```

**Body for TEXT block:**
```json
{
  "pageId": "page-id",
  "blockType": "TEXT",
  "order": 1,
  "contentJson": {
    "text": "# Tiêu đề\n\nNội dung văn bản...",
    "format": "markdown"
  }
}
```

**Body for VIDEO block:**
```json
{
  "pageId": "page-id",
  "blockType": "VIDEO",
  "order": 2,
  "contentJson": {
    "videoUrl": "https://youtube.com/watch?v=abc123",
    "title": "Video hướng dẫn",
    "duration": 300
  }
}
```

**Body for H5P block:**
```json
{
  "pageId": "page-id",
  "blockType": "H5P",
  "order": 3,
  "h5pContentId": "h5p-content-id",
  "contentJson": {
    "title": "Quiz tương tác",
    "description": "Bài tập kiểm tra"
  }
}
```

**Body for IMAGE block:**
```json
{
  "pageId": "page-id",
  "blockType": "IMAGE",
  "order": 4,
  "contentJson": {
    "imageUrl": "https://example.com/image.jpg",
    "alt": "Mô tả hình ảnh",
    "caption": "Chú thích hình ảnh"
  }
}
```

### 2. Get PageBlocks by Page
```http
GET /page-blocks/page/{pageId}
Authorization: Bearer {jwt-token}
```

### 3. Get PageBlock Details
```http
GET /page-blocks/{pageBlockId}
Authorization: Bearer {jwt-token}
```

### 4. Update PageBlock
```http
PUT /page-blocks/{pageBlockId}
Authorization: Bearer {jwt-token}
Roles: ADMIN, TEACHER
```

### 5. Delete PageBlock
```http
DELETE /page-blocks/{pageBlockId}
Authorization: Bearer {jwt-token}
Roles: ADMIN, TEACHER
```

## 📊 StudentProgress API (Updated)

### 1. Create Progress
```http
POST /student-progress
Authorization: Bearer {jwt-token}
```

**Body:**
```json
{
  "userId": "student-user-id",
  "pageBlockId": "page-block-id",
  "status": "IN_PROGRESS"
}
```

### 2. Get Student Progress
```http
GET /student-progress/user/{userId}
Authorization: Bearer {jwt-token}
```

### 3. Get My Progress
```http
GET /student-progress/my-progress
Authorization: Bearer {jwt-token}
```

### 4. Update Progress (Updated URL)
```http
PATCH /student-progress/{userId}/{pageBlockId}
Authorization: Bearer {jwt-token}
```

**Body:**
```json
{
  "status": "COMPLETED",
  "timeSpent": 300,
  "completedAt": "2024-10-21T10:30:00Z"
}
```

### 5. Get Progress by Lesson
```http
GET /student-progress/lesson/{lessonId}
Authorization: Bearer {jwt-token}
```

### 6. Get Progress Summary
```http
GET /student-progress/summary?userId={userId}&lessonId={lessonId}
Authorization: Bearer {jwt-token}
```

**Response:**
```json
{
  "userId": "user-id",
  "lessonId": "lesson-id",
  "totalPageBlocks": 12,
  "completedPageBlocks": 8,
  "progressPercentage": 66.7,
  "timeSpent": 1800,
  "lastAccessed": "2024-10-21T10:30:00Z",
  "progressByType": {
    "TEXT": { "completed": 4, "total": 5 },
    "VIDEO": { "completed": 2, "total": 3 },
    "H5P": { "completed": 2, "total": 4 }
  }
}
```

### 7. Create Quiz Attempt
```http
POST /student-progress/quiz-attempt
Authorization: Bearer {jwt-token}
```

**Body:**
```json
{
  "studentProgressId": "progress-id",
  "score": 85.5,
  "isPass": true,
  "statement": {
    "actor": { "name": "Nguyễn Văn An" },
    "verb": { "display": { "en-US": "completed" } },
    "object": { "definition": { "name": { "en-US": "Counting Quiz" } } },
    "result": { 
      "score": { "scaled": 0.855 }, 
      "completion": true, 
      "success": true 
    }
  }
}
```

### 8. Get Quiz Attempts
```http
GET /student-progress/{progressId}/quiz-attempts
Authorization: Bearer {jwt-token}
```

## 🎮 H5P API (Updated)

### 1. Upload H5P Package
```http
POST /h5p/upload
Authorization: Bearer {jwt-token}
Roles: ADMIN, TEACHER
Content-Type: multipart/form-data
```

**Body:**
- `file`: H5P package file (.h5p)
- `installContentOnly` (optional): "true" to install content only

### 2. Get H5P Content List
```http
GET /h5p/content
Authorization: Bearer {jwt-token}
```

### 3. Get H5P Content Details
```http
GET /h5p/content/{contentId}
Authorization: Bearer {jwt-token}
```

### 4. Get H5P Player Integration
```http
GET /h5p/player/{contentId}
Authorization: Bearer {jwt-token}
```

### 5. Get H5P by PageBlock (Updated)
```http
GET /h5p/page-block/{pageBlockId}/content
Authorization: Bearer {jwt-token}
```

### 6. Create H5P Content for PageBlock (Updated)
```http
POST /h5p/page-block/{pageBlockId}/content
Authorization: Bearer {jwt-token}
Roles: ADMIN, TEACHER
```

**Body:**
```json
{
  "title": "Quiz đếm số",
  "library": "H5P.QuestionSet 1.17",
  "params": {
    "introPage": {
      "showIntroPage": true,
      "title": "Quiz đếm số từ 1 đến 10"
    },
    "questions": [
      {
        "library": "H5P.MultiChoice 1.14",
        "params": {
          "question": "Số nào đứng sau số 5?",
          "answers": [
            { "correct": false, "text": "4" },
            { "correct": true, "text": "6" },
            { "correct": false, "text": "3" }
          ]
        }
      }
    ]
  },
  "metadata": {
    "title": "Quiz đếm số",
    "authors": [{ "name": "Teacher", "role": "Author" }]
  },
  "isPublic": false
}
```

### 7. Get H5P by Page (Updated)
```http
GET /h5p/page/{pageId}/content
Authorization: Bearer {jwt-token}
```

### 8. Get H5P by Book (Updated)
```http
GET /h5p/book/{bookId}/content
Authorization: Bearer {jwt-token}
```

### 9. Get H5P by Class
```http
GET /h5p/class/{classId}/content
Authorization: Bearer {jwt-token}
```

### 10. Update H5P Content
```http
PUT /h5p/content/{contentId}
Authorization: Bearer {jwt-token}
Roles: ADMIN, TEACHER
```

### 11. Delete H5P Content
```http
DELETE /h5p/content/{contentId}
Authorization: Bearer {jwt-token}
Roles: ADMIN, TEACHER
```

### 12. Export H5P Content
```http
GET /h5p/export/{contentId}
Authorization: Bearer {jwt-token}
Roles: ADMIN, TEACHER
```

## 👥 Users API

### 1. Get Users List
```http
GET /users
Authorization: Bearer {jwt-token}
Roles: ADMIN
```

### 2. Get User Details
```http
GET /users/{userId}
Authorization: Bearer {jwt-token}
```

### 3. Update User
```http
PATCH /users/{userId}
Authorization: Bearer {jwt-token}
```

## 📊 Data Models

### Book
```json
{
  "id": "string",
  "title": "string",
  "subject": "string",
  "grade": "number (1-12)",
  "description": "string?",
  "thumbnailUrl": "string?",
  "isPublished": "boolean",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Chapter
```json
{
  "id": "string",
  "bookId": "string",
  "title": "string",
  "order": "number",
  "description": "string?",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Lesson
```json
{
  "id": "string",
  "bookId": "string",
  "chapterId": "string",
  "title": "string",
  "order": "number",
  "description": "string?",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Page
```json
{
  "id": "string",
  "lessonId": "string",
  "title": "string",
  "order": "number",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### PageBlock
```json
{
  "id": "string",
  "pageId": "string",
  "order": "number",
  "blockType": "TEXT | VIDEO | H5P | IMAGE | QUIZ",
  "contentJson": "object?",
  "h5pContentId": "string?"
}
```

### StudentProgress
```json
{
  "id": "string",
  "userId": "string",
  "pageBlockId": "string",
  "status": "NOT_STARTED | IN_PROGRESS | COMPLETED",
  "timeSpent": "number?",
  "completedAt": "datetime?",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

## 🔒 Authorization

### User Roles
- **STUDENT**: Can view assigned books, complete content, track progress
- **TEACHER**: Can create/edit books, manage classes, view student progress
- **ADMIN**: Full system access, user management

### Permission Matrix
| Endpoint | STUDENT | TEACHER | ADMIN |
|----------|---------|---------|-------|
| GET /books | ✅ | ✅ | ✅ |
| POST /books | ❌ | ✅ | ✅ |
| PUT /books/:id | ❌ | ✅* | ✅ |
| DELETE /books/:id | ❌ | ❌ | ✅ |
| POST /page-blocks | ❌ | ✅ | ✅ |
| PUT /page-blocks/:id | ❌ | ✅* | ✅ |
| POST /classes | ❌ | ✅ | ✅ |
| GET /student-progress/user/:id | ✅* | ✅* | ✅ |

*\* = Own resources only or assigned classes*

## 🚫 Error Responses

### Common Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate data)
- `500` - Internal Server Error

### Error Response Format
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

## 📈 Rate Limiting

- **Authentication endpoints**: 5 requests/minute
- **Upload endpoints**: 3 requests/minute  
- **General API**: 100 requests/minute
- **H5P content**: 50 requests/minute

## 📱 API Versioning

Current version: `v2.0.0`

**Version Headers:**
```http
API-Version: 2.0.0
Accept-Version: 2.0.0
```

## 🔧 Development

### Environment Variables
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ebook_reader"
JWT_SECRET="your-jwt-secret"
NODE_ENV="development"
PORT=3000
```

### Testing
```bash
# Run all tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Migration
```bash
# Run migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset

# Generate client
npx prisma generate
```

## 📞 Support

- **Documentation**: `/doc/`
- **Postman Collection**: `/doc/test/ebook-reader-postman-collection.json`
- **Testing Guide**: `/doc/test/TESTING_GUIDE.md`
- **Database Guide**: `/doc/DATABASE_REFACTORING_GUIDE.md`
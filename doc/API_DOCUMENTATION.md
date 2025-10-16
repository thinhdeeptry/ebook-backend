# API Documentation - E-Learning Backend

## 📋 Tổng quan

Backend API cho ứng dụng e-learning được xây dựng với NestJS, hỗ trợ quản lý người dùng, sách EPUB, nội dung H5P và tracking học tập.

**Base URL:** `http://localhost:3001`

**Authentication:** JWT Bearer Token

## 🔐 Authentication

### 1. Register User
```http
POST /auth/register
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "STUDENT" // STUDENT | TEACHER | ADMIN
}
```

**Response:**
```json
{
  "user": {
    "id": "clxxxxx",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "STUDENT",
    "createdAt": "2025-10-02T00:00:00.000Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIs..."
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
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "clxxxxx",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "STUDENT"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 3. Get Profile
```http
GET /auth/profile
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "clxxxxx",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "STUDENT",
  "avatar": null,
  "isActive": true,
  "createdAt": "2025-10-02T00:00:00.000Z",
  "updatedAt": "2025-10-02T00:00:00.000Z"
}
```

---

## 👥 Users Management

### 1. Get All Users
```http
GET /users
Authorization: Bearer {token}
Roles: ADMIN, TEACHER
```

**Response:**
```json
[
  {
    "id": "clxxxxx",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "STUDENT",
    "isActive": true,
    "avatar": null,
    "createdAt": "2025-10-02T00:00:00.000Z"
  }
]
```

### 2. Get Users by Role
```http
GET /users/role/{role}
Authorization: Bearer {token}
Roles: ADMIN, TEACHER
```

**Parameters:**
- `role`: STUDENT | TEACHER | ADMIN

### 3. Get User by ID
```http
GET /users/{id}
Authorization: Bearer {token}
Roles: ADMIN, TEACHER
```

**Response:**
```json
{
  "id": "clxxxxx",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "STUDENT",
  "isActive": true,
  "avatar": null,
  "createdAt": "2025-10-02T00:00:00.000Z",
  "updatedAt": "2025-10-02T00:00:00.000Z",
  "_count": {
    "ebooks": 5,
    "h5pContents": 3,
    "trackingEvents": 150
  }
}
```

### 4. Get User Statistics
```http
GET /users/{id}/stats
Authorization: Bearer {token}
Roles: ADMIN, TEACHER
```

### 5. Create User
```http
POST /users
Authorization: Bearer {token}
Roles: ADMIN
```

**Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "TEACHER",
  "avatar": "https://example.com/avatar.jpg"
}
```

### 6. Update User
```http
PATCH /users/{id}
Authorization: Bearer {token}
Roles: ADMIN, TEACHER, STUDENT (own profile)
```

**Body:**
```json
{
  "firstName": "Jane Updated",
  "lastName": "Smith Updated",
  "avatar": "https://example.com/new-avatar.jpg",
  "isActive": true,
  "role": "TEACHER"
}
```

### 7. Delete User
```http
DELETE /users/{id}
Authorization: Bearer {token}
Roles: ADMIN
```

---

## 📚 EPUB Management

### 1. Get All Ebooks
```http
GET /epub
Authorization: Bearer {token}
```

**Query Parameters:**
- `public=true`: Chỉ lấy sách public (không cần auth)

**Response:**
```json
[
  {
    "id": "clxxxxx",
    "title": "Learn English Grammar",
    "author": "John Author",
    "description": "Complete guide to English grammar",
    "fileName": "english-grammar.epub",
    "fileSize": "5242880",
    "coverImage": "/uploads/covers/cover.jpg",
    "isPublic": true,
    "createdAt": "2025-10-02T00:00:00.000Z",
    "uploader": {
      "id": "clxxxxx",
      "firstName": "Teacher",
      "lastName": "Name",
      "email": "teacher@example.com"
    }
  }
]
```

### 2. Get Ebook Statistics
```http
GET /epub/stats
Authorization: Bearer {token}
Roles: ADMIN, TEACHER
```

**Response:**
```json
{
  "totalBooks": 25,
  "publicBooks": 15,
  "privateBooks": 10,
  "averageFileSize": 8388608
}
```

### 3. Get Ebook by ID
```http
GET /epub/{id}
Authorization: Bearer {token}
```

### 4. Get Ebook Content
```http
GET /epub/{id}/content
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "clxxxxx",
  "title": "Learn English Grammar",
  "author": "John Author",
  "metadata": {
    "title": "Learn English Grammar",
    "author": "John Author",
    "language": "en",
    "publisher": "Education Press",
    "tableOfContents": [...]
  },
  "filePath": "/uploads/epub/file-123456.epub"
}
```

### 5. Download Ebook
```http
GET /epub/{id}/download
Authorization: Bearer {token}
```

**Response:** File stream (application/epub+zip)

### 6. Create Ebook Entry
```http
POST /epub
Authorization: Bearer {token}
Roles: TEACHER, ADMIN
```

**Body:**
```json
{
  "title": "New Book Title",
  "author": "Author Name",
  "description": "Book description",
  "isPublic": false
}
```

### 7. Upload Ebook File
```http
POST /epub/upload
Authorization: Bearer {token}
Roles: TEACHER, ADMIN
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: EPUB file (max 100MB)

**Response:**
```json
{
  "id": "clxxxxx",
  "title": "Extracted Book Title",
  "author": "Extracted Author",
  "description": "",
  "filePath": "/uploads/epub/file-123456.epub",
  "fileName": "original-name.epub",
  "fileSize": "5242880",
  "uploaderId": "clxxxxx",
  "isPublic": false,
  "metadata": {...},
  "coverImage": null,
  "createdAt": "2025-10-02T00:00:00.000Z",
  "uploader": {...}
}
```

### 8. Update Ebook
```http
PATCH /epub/{id}
Authorization: Bearer {token}
Roles: TEACHER, ADMIN
```

### 9. Delete Ebook
```http
DELETE /epub/{id}
Authorization: Bearer {token}
Roles: TEACHER, ADMIN (own content)
```

---

## 🎮 H5P Content Management

### 1. Get All H5P Content
```http
GET /h5p
Authorization: Bearer {token}
```

**Query Parameters:**
- `public=true`: Chỉ lấy content public

### 2. Get H5P Editor Data
```http
GET /h5p/editor/{contentId?}
Authorization: Bearer {token}
Roles: TEACHER, ADMIN
```

**Response:**
```json
{
  "libraries": [],
  "content": {
    "library": "H5P.InteractiveVideo",
    "params": {...},
    "metadata": {...}
  },
  "language": "en"
}
```

### 3. Get H5P Player Data
```http
GET /h5p/content/{contentId}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "content": {
    "library": "H5P.InteractiveVideo",
    "params": {...},
    "metadata": {...}
  },
  "integration": {
    "url": "/h5p",
    "postUserStatistics": true,
    "ajax": {
      "setFinished": "/h5p/setFinished",
      "contentUserData": "/h5p/contentUserData"
    }
  }
}
```

### 4. Get H5P Content by ID
```http
GET /h5p/{id}
Authorization: Bearer {token}
```

### 5. Create H5P Content
```http
POST /h5p
Authorization: Bearer {token}
Roles: TEACHER, ADMIN
```

**Body:**
```json
{
  "title": "Interactive Quiz",
  "library": "H5P.QuestionSet",
  "params": {
    "questions": [...]
  },
  "metadata": {
    "title": "Interactive Quiz",
    "language": "en"
  },
  "isPublic": false
}
```

### 6. Upload H5P File
```http
POST /h5p/upload
Authorization: Bearer {token}
Roles: TEACHER, ADMIN
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: H5P file (max 50MB)

### 7. Update H5P Content
```http
PATCH /h5p/{id}
Authorization: Bearer {token}
Roles: TEACHER, ADMIN
```

### 8. Delete H5P Content
```http
DELETE /h5p/{id}
Authorization: Bearer {token}
Roles: TEACHER, ADMIN (own content)
```

---

## 📊 Tracking & Analytics

### 1. Create Tracking Event
```http
POST /tracking
Authorization: Bearer {token}
```

**Body (xAPI Statement):**
```json
{
  "verb": "completed",
  "objectId": "chapter-1",
  "contentId": "clxxxxx",
  "statement": {
    "actor": {
      "name": "John Doe",
      "mbox": "mailto:john@example.com"
    },
    "verb": {
      "id": "http://adlnet.gov/expapi/verbs/completed",
      "display": {"en-US": "completed"}
    },
    "object": {
      "id": "chapter-1",
      "definition": {
        "name": {"en-US": "Chapter 1: Introduction"}
      }
    }
  },
  "result": {
    "completion": true,
    "score": {
      "raw": 85,
      "max": 100
    }
  },
  "context": {
    "instructor": "Teacher Name",
    "platform": "E-Learning Platform"
  }
}
```

### 2. Get Tracking Events
```http
GET /tracking
Authorization: Bearer {token}
```

**Query Parameters:**
- `userId`: Filter by user ID
- `contentId`: Filter by content ID
- `verb`: Filter by verb (completed, experienced, answered, etc.)
- `startDate`: Start date (ISO string)
- `endDate`: End date (ISO string)

### 3. Get Analytics Data
```http
GET /tracking/analytics
Authorization: Bearer {token}
Roles: TEACHER, ADMIN
```

**Response:**
```json
{
  "totalEvents": 1250,
  "verbDistribution": [
    {"verb": "completed", "count": 450},
    {"verb": "experienced", "count": 600},
    {"verb": "answered", "count": 200}
  ],
  "activeUsers": 45,
  "contentEngagement": [
    {"contentId": "clxxxxx", "interactions": 125},
    {"contentId": "clyyyyyy", "interactions": 89}
  ]
}
```

### 4. Get User Progress
```http
GET /tracking/progress/{userId}
Authorization: Bearer {token}
Roles: STUDENT (own), TEACHER, ADMIN
```

**Query Parameters:**
- `contentId`: Filter by specific content

**Response:**
```json
[
  {
    "contentId": "clxxxxx",
    "contentTitle": "English Grammar Course",
    "totalInteractions": 45,
    "completedSections": 8,
    "lastActivity": "2025-10-02T10:30:00.000Z",
    "progress": 80
  }
]
```

### 5. Get Tracking Event by ID
```http
GET /tracking/{id}
Authorization: Bearer {token}
```

### 6. Delete Tracking Event
```http
DELETE /tracking/{id}
Authorization: Bearer {token}
Roles: ADMIN
```

---

## 📝 Error Responses

### Common Error Formats:

**400 Bad Request:**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

**401 Unauthorized:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**403 Forbidden:**
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

**422 Validation Error:**
```json
{
  "statusCode": 422,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Unprocessable Entity"
}
```

---

## 🔒 Role-Based Access Control

| Endpoint | STUDENT | TEACHER | ADMIN |
|----------|---------|---------|-------|
| GET /auth/profile | ✅ | ✅ | ✅ |
| GET /users | ❌ | ✅ | ✅ |
| POST /users | ❌ | ❌ | ✅ |
| PATCH /users/:id | ✅ (own) | ✅ (limited) | ✅ |
| DELETE /users/:id | ❌ | ❌ | ✅ |
| GET /epub | ✅ | ✅ | ✅ |
| POST /epub/upload | ❌ | ✅ | ✅ |
| DELETE /epub/:id | ❌ | ✅ (own) | ✅ |
| GET /h5p | ✅ | ✅ | ✅ |
| POST /h5p | ❌ | ✅ | ✅ |
| POST /tracking | ✅ | ✅ | ✅ |
| GET /tracking/analytics | ❌ | ✅ | ✅ |
| DELETE /tracking/:id | ❌ | ❌ | ✅ |

---

## 📤 File Upload Specifications

### EPUB Files:
- **Endpoint:** POST /epub/upload
- **Field name:** `file`
- **Allowed extensions:** `.epub`
- **Max size:** 100MB
- **Storage:** `./uploads/epub/`

### H5P Files:
- **Endpoint:** POST /h5p/upload
- **Field name:** `file`
- **Allowed extensions:** `.h5p`
- **Max size:** 50MB
- **Storage:** `./uploads/h5p/`

---

## 🚀 Quick Start

1. **Get access token:**
   ```bash
   curl -X POST http://localhost:3001/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"admin123"}'
   ```

2. **Use token in subsequent requests:**
   ```bash
   curl -X GET http://localhost:3001/users \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

3. **Upload a file:**
   ```bash
   curl -X POST http://localhost:3001/epub/upload \
     -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -F "file=@/path/to/your/book.epub"
   ```
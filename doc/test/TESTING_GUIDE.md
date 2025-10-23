# E-book Reader System Testing Guide

## Tổng quan
Hướng dẫn testing cho hệ thống E-book Reader sau khi refactor từ Course/LessonStep sang Book/Chapter/Page/PageBlock.

## Cấu hình Testing Environment

### 1. Import Postman Collection & Environment
- Import file: `doc/test/ebook-reader-postman-collection.json`
- Import environment: `doc/test/education-system-environment.json` (đã cập nhật)

### 2. Cấu hình Environment Variables
```json
{
  "base_url": "http://localhost:3000",
  "admin_email": "admin@school.edu.vn",
  "admin_password": "Admin123!",
  "teacher_email": "teacher@school.edu.vn", 
  "teacher_password": "Teacher123!",
  "student_email": "student@school.edu.vn",
  "student_password": "Student123!"
}
```

## Testing Flow (Workflow đầy đủ)

### Phase 1: Authentication Setup
1. **Đăng ký tài khoản Admin** ✅
2. **Đăng ký tài khoản Teacher** ✅  
3. **Đăng ký tài khoản Student** ✅
4. **Đăng nhập với Admin** ✅
   - Auto-set `jwt_token` và `user_id`

### Phase 2: Classes Management
5. **Tạo lớp học mới** ✅
   - Auto-set `class_id`
6. **Lấy danh sách lớp học** ✅
7. **Thêm học sinh vào lớp** ✅

### Phase 3: Books Management  
8. **Tạo sách mới** ✅
   - Auto-set `book_id`
9. **Lấy danh sách sách** ✅
10. **Lấy sách theo lớp** ✅
11. **Tìm kiếm sách** ✅
12. **Xuất bản sách** ✅

### Phase 4: Content Structure Creation
13. **Tạo bài học** (cần `chapter_id` từ seed data) ✅
    - Auto-set `lesson_id`
14. **Tạo trang mới** ✅
    - Auto-set `page_id`
15. **Tạo Page Block TEXT** ✅
    - Auto-set `page_block_id`
16. **Tạo Page Block VIDEO** ✅
17. **Upload H5P content** ✅
    - Auto-set `h5p_content_id`
18. **Tạo Page Block H5P** ✅

### Phase 5: Student Progress Tracking
19. **Tạo tiến độ học tập** ✅
    - Auto-set `progress_id`
20. **Cập nhật tiến độ** ✅
21. **Lấy tiến độ theo bài học** ✅
22. **Tạo quiz attempt** ✅

### Phase 6: H5P Integration Testing
23. **Lấy H5P theo Page Block** ✅
24. **Lấy H5P theo Page** ✅
25. **Lấy H5P theo Book** ✅
26. **Lấy H5P theo Class** ✅

## Key Testing Scenarios

### Scenario 1: Content Creation Flow
```
1. Tạo Class → 2. Tạo Book → 3. Gán Book cho Class → 
4. Tạo Chapter → 5. Tạo Lesson → 6. Tạo Page → 
7. Tạo PageBlocks → 8. Upload H5P → 9. Link H5P
```

### Scenario 2: Student Learning Flow  
```
1. Student Login → 2. Xem Books assigned → 3. Đọc Pages →
4. Interact với PageBlocks → 5. Complete H5P → 6. Track Progress
```

### Scenario 3: Teacher Management Flow
```
1. Teacher Login → 2. Manage Classes → 3. Create/Edit Books → 
4. Add Content → 5. Monitor Student Progress → 6. Analyze Data
```

## API Endpoints Testing Checklist

### 🔐 Authentication APIs
- [ ] POST `/auth/register` (Admin, Teacher, Student)
- [ ] POST `/auth/login`  
- [ ] GET `/auth/profile`

### 🏫 Classes APIs
- [ ] POST `/classes` - Tạo lớp
- [ ] GET `/classes` - Lấy danh sách lớp
- [ ] GET `/classes/:id` - Chi tiết lớp
- [ ] GET `/classes/:id/books` - Sách theo lớp (Updated)
- [ ] GET `/classes/:id/members` - Học sinh trong lớp
- [ ] POST `/classes/:id/students` - Thêm học sinh
- [ ] PUT `/classes/:id` - Cập nhật lớp

### 📚 Books APIs (New)
- [ ] POST `/books` - Tạo sách
- [ ] GET `/books` - Danh sách sách 
- [ ] GET `/books/:id` - Chi tiết sách
- [ ] GET `/books/class/:classId` - Sách theo lớp
- [ ] GET `/books/search` - Tìm kiếm sách
- [ ] PUT `/books/:id` - Cập nhật sách
- [ ] POST `/books/:id/publish` - Xuất bản sách

### 📖 Lessons APIs (Updated)
- [ ] POST `/lessons` - Tạo bài học
- [ ] GET `/lessons/book/:bookId` - Bài học theo sách (Updated)
- [ ] GET `/lessons/chapter/:chapterId` - Bài học theo chương (New)
- [ ] GET `/lessons/:id` - Chi tiết bài học
- [ ] GET `/lessons/search` - Tìm kiếm bài học
- [ ] PUT `/lessons/:id` - Cập nhật bài học

### 📄 Pages APIs (New)
- [ ] POST `/pages` - Tạo trang
- [ ] GET `/pages/lesson/:lessonId` - Trang theo bài học
- [ ] GET `/pages/:id` - Chi tiết trang

### 🧩 PageBlocks APIs (New - thay thế LessonSteps)
- [ ] POST `/page-blocks` - Tạo page block
- [ ] GET `/page-blocks/page/:pageId` - Page blocks theo trang
- [ ] GET `/page-blocks/:id` - Chi tiết page block  
- [ ] PUT `/page-blocks/:id` - Cập nhật page block

### 📊 StudentProgress APIs (Updated)
- [ ] POST `/student-progress` - Tạo tiến độ
- [ ] GET `/student-progress/user/:userId` - Tiến độ theo user
- [ ] GET `/student-progress/my-progress` - Tiến độ của tôi
- [ ] PATCH `/student-progress/:userId/:pageBlockId` - Cập nhật (Updated URL)
- [ ] GET `/student-progress/lesson/:lessonId` - Tiến độ theo bài học
- [ ] GET `/student-progress/summary` - Thống kê tổng quan
- [ ] POST `/student-progress/quiz-attempt` - Tạo quiz attempt
- [ ] GET `/student-progress/:progressId/quiz-attempts` - Lịch sử quiz

### 🎮 H5P APIs (Updated)
- [ ] POST `/h5p/upload` - Upload H5P package
- [ ] GET `/h5p/content` - Danh sách H5P
- [ ] GET `/h5p/content/:id` - Chi tiết H5P  
- [ ] GET `/h5p/player/:id` - Player integration
- [ ] GET `/h5p/page-block/:pageBlockId/content` - H5P theo PageBlock (Updated)
- [ ] POST `/h5p/page-block/:pageBlockId/content` - Tạo H5P cho PageBlock (Updated)
- [ ] GET `/h5p/page/:pageId/content` - H5P theo Page (Updated)
- [ ] GET `/h5p/book/:bookId/content` - H5P theo Book (Updated)
- [ ] GET `/h5p/class/:classId/content` - H5P theo Class
- [ ] PUT `/h5p/content/:id` - Cập nhật H5P
- [ ] DELETE `/h5p/content/:id` - Xóa H5P

### 👥 Users APIs
- [ ] GET `/users` - Danh sách người dùng
- [ ] GET `/users/:id` - Chi tiết user
- [ ] PATCH `/users/:id` - Cập nhật user

## Database Testing

### 1. Kiểm tra Migration
```bash
npx prisma migrate status
```

### 2. Seed Data Testing
```bash  
npx prisma db seed
```

### 3. Database Inspection
```bash
npx prisma studio
```

## Performance Testing

### 1. Load Testing với Artillery
```bash
npm install -g artillery
artillery quick --count 10 --num 5 http://localhost:3000/books
```

### 2. API Response Time
- Books API: < 200ms
- Complex queries (with relations): < 500ms
- H5P content loading: < 1s

## Error Handling Testing

### 1. Validation Errors
- Test với missing required fields
- Test với invalid data types
- Test với invalid relationships

### 2. Authorization Errors  
- Test endpoints without JWT token
- Test với wrong user roles
- Test access to resources user không own

### 3. Not Found Errors
- Test với non-existent IDs
- Test deleted resources

## Integration Testing Scenarios

### 1. Cross-Module Testing
- Tạo Book → Add to Class → Create Lessons → Track Progress
- Upload H5P → Link to PageBlock → Student completes → Record xAPI

### 2. Data Consistency Testing
- Delete Book → Check orphaned data
- Update relationships → Verify cascade updates
- Change user roles → Test permission changes

## Automated Testing

### 1. Unit Tests
```bash
npm run test
```

### 2. E2E Tests  
```bash
npm run test:e2e
```

### 3. Coverage Report
```bash
npm run test:cov
```

## Rollback Testing

### 1. Test Migration Rollback
```bash
npx prisma migrate reset --force
```

### 2. Data Recovery Testing
- Test backup/restore procedures
- Verify data integrity after rollback

## Monitoring & Logging

### 1. API Logs
- Check logs trong quá trình testing
- Monitor error patterns
- Track performance metrics

### 2. Database Logs
- Query performance
- Connection pooling
- Transaction logs

## Common Issues & Solutions

### 1. Foreign Key Constraints
- Ensure proper order khi creating related entities
- Check cascade delete behavior

### 2. JWT Token Expiration
- Test token refresh mechanisms
- Handle expired token scenarios

### 3. File Upload Issues
- Test H5P file size limits
- Verify file type validation
- Check storage permissions

## Testing Report Template

```markdown
# Testing Report - E-book Reader System

## Test Summary
- **Date**: [Date]
- **Tester**: [Name] 
- **Version**: [Version]
- **Environment**: [Dev/Staging/Prod]

## Results Overview
- ✅ Passed: XX/XX tests
- ❌ Failed: XX/XX tests  
- ⚠️ Warnings: XX issues

## Detailed Results
[List specific test results]

## Issues Found
[List bugs/issues discovered]

## Performance Metrics
[API response times, load test results]

## Recommendations
[Suggestions for improvements]
```

## Next Steps

1. **Automate Testing**: Set up CI/CD pipeline với automated tests
2. **Monitoring**: Implement application monitoring và alerting  
3. **Documentation**: Keep test documentation updated với code changes
4. **Training**: Train team members trên new API structure
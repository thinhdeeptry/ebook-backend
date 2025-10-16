# Hướng dẫn sử dụng Postman Collection

## Tổng quan
Collection này bao gồm tất cả API endpoints cho E-Learning Platform được xây dựng bằng NestJS.

## Cài đặt và Import

### 1. Import Collection
1. Mở Postman
2. Click **Import** button
3. Chọn file `postman-collection.json`
4. Import thành công

### 2. Import Environment (Tùy chọn)
1. Click **Import** button
2. Chọn file `postman-environment.json`
3. Chọn environment "E-Learning Environment" từ dropdown

## Cấu hình

### Biến môi trường (Environment Variables)
- `baseUrl`: URL của backend server (mặc định: `http://localhost:3001`)
- `accessToken`: JWT token (tự động được set sau khi login)
- `userId`: ID của user hiện tại (tự động được set sau khi login)
- `ebookId`: ID của ebook để test
- `h5pContentId`: ID của H5P content để test
- `trackingEventId`: ID của tracking event để test

### Tự động lưu Token
Collection đã được cấu hình để tự động lưu JWT token khi login thành công:
```javascript
if (responseCode.code === 200 || responseCode.code === 201) {
    const response = pm.response.json();
    pm.environment.set('accessToken', response.access_token);
    pm.environment.set('userId', response.user.id);
}
```

## Cấu trúc Collection

### 🔐 Authentication
- **Register User**: Đăng ký tài khoản mới
- **Login**: Đăng nhập và lấy JWT token
- **Get Profile**: Lấy thông tin profile của user hiện tại

### 👥 User Management
- **Get All Users**: Lấy danh sách tất cả users (Admin only)
- **Get Users by Role**: Lọc users theo role (STUDENT/TEACHER/ADMIN)
- **Get User by ID**: Lấy thông tin chi tiết của 1 user
- **Get User Statistics**: Thống kê hoạt động của user
- **Create User**: Tạo user mới (Admin only)
- **Update User**: Cập nhật thông tin user
- **Delete User**: Xóa user (Admin only)

### 📚 EPUB Management
- **Get All Ebooks**: Lấy danh sách ebooks
- **Get Public Ebooks**: Lấy ebooks công khai (không cần auth)
- **Get Ebook Statistics**: Thống kê ebooks
- **Get Ebook by ID**: Lấy thông tin chi tiết ebook
- **Get Ebook Content**: Lấy nội dung ebook
- **Download Ebook**: Tải xuống file EPUB
- **Create Ebook Entry**: Tạo metadata cho ebook
- **Upload Ebook File**: Upload file .epub
- **Update Ebook**: Cập nhật thông tin ebook
- **Delete Ebook**: Xóa ebook

### 🎮 H5P Content
- **Get All H5P Content**: Lấy danh sách H5P content
- **Get H5P Editor Data**: Lấy dữ liệu cho H5P editor
- **Get H5P Player Data**: Lấy dữ liệu để play H5P content
- **Create H5P Content**: Tạo H5P content mới
- **Upload H5P File**: Upload file .h5p
- **Update H5P Content**: Cập nhật H5P content
- **Delete H5P Content**: Xóa H5P content

### 📊 Tracking & Analytics
- **Create Tracking Event**: Tạo sự kiện theo dõi (xAPI)
- **Get All Tracking Events**: Lấy danh sách events
- **Get Tracking Events with Filters**: Lọc events theo điều kiện
- **Get Analytics Data**: Lấy dữ liệu phân tích
- **Get User Progress**: Xem tiến trình học tập của user
- **Delete Tracking Event**: Xóa event

### 🧪 Test Scenarios
- **Complete Learning Flow**: Workflow hoàn chỉnh của student
- **Teacher Workflow**: Workflow của giáo viên

## Quy trình Test khuyến nghị

### 1. Khởi tạo
1. Chạy server backend: `npm run start:dev`
2. Đảm bảo database đã được setup
3. Set `baseUrl` trong environment

### 2. Authentication Flow
1. **Register User** - Tạo tài khoản test
2. **Login** - Đăng nhập (token sẽ tự động được lưu)
3. **Get Profile** - Verify token hoạt động

### 3. Test Complete Flow
1. Chạy các request trong **Test Scenarios > Complete Learning Flow**
2. Chạy các request trong **Test Scenarios > Teacher Workflow**

### 4. Test từng Module
- Test từng nhóm API một cách có hệ thống
- Kiểm tra error cases bằng cách gửi data không hợp lệ
- Test authorization bằng cách thử access với role không đủ quyền

## Lưu ý quan trọng

### Authentication
- Hầu hết APIs yêu cầu JWT token trong header: `Authorization: Bearer {token}`
- Token có thời hạn, cần login lại khi expired
- Một số endpoints công khai không cần token

### File Upload
- Sử dụng `multipart/form-data` cho upload files
- EPUB files: `.epub` extension
- H5P files: `.h5p` extension
- Đảm bảo file size không vượt quá giới hạn server

### Role-based Access
- **ADMIN**: Full access to all endpoints
- **TEACHER**: Can manage content and view analytics
- **STUDENT**: Limited to viewing and tracking

### Error Handling
- 400: Bad Request - Invalid input data
- 401: Unauthorized - Missing or invalid token
- 403: Forbidden - Insufficient permissions
- 404: Not Found - Resource doesn't exist
- 500: Internal Server Error - Server issue

## Troubleshooting

### Connection Issues
- Kiểm tra server có đang chạy không
- Verify `baseUrl` trong environment
- Check firewall/network settings

### Authentication Issues
- Đảm bảo token chưa expired
- Check token format trong Authorization header
- Verify user có đúng role không

### File Upload Issues
- Kiểm tra file format (.epub, .h5p)
- Check file size limits
- Ensure proper Content-Type header

### Database Issues  
- Đảm bảo database connection đang hoạt động
- Check Prisma migration status
- Verify environment variables

## Sample Data

### Sample User Accounts
```json
{
  "email": "admin@example.com",
  "password": "admin123",
  "role": "ADMIN"
}

{
  "email": "teacher@example.com", 
  "password": "teacher123",
  "role": "TEACHER"
}

{
  "email": "student@example.com",
  "password": "student123", 
  "role": "STUDENT"
}
```

### Sample H5P Content Structure
```json
{
  "title": "Interactive Quiz",
  "library": "H5P.QuestionSet",
  "params": {
    "questions": [
      {
        "library": "H5P.MultiChoice",
        "question": "What is the capital of France?",
        "answers": [
          {"text": "London", "correct": false},
          {"text": "Paris", "correct": true},
          {"text": "Berlin", "correct": false}
        ]
      }
    ]
  },
  "metadata": {
    "title": "Interactive Quiz",
    "language": "en"
  }
}
```

## Liên hệ hỗ trợ
- Nếu gặp vấn đề với APIs, check server logs
- Đối với lỗi database, kiểm tra Prisma connection
- File upload issues thường liên quan đến file size/format
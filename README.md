# E-Learning Backend API

Backend cho ứng dụng e-learning được xây dựng bằng NestJS, tích hợp với PostgreSQL, Prisma ORM, JWT Authentication, và hỗ trợ upload file H5P/EPUB.

## 🚀 Tính năng chính

- ✅ **Authentication & Authorization** với JWT và Passport
- ✅ **Quản lý người dùng** với phân quyền (Student/Teacher/Admin)
- ✅ **Upload và quản lý sách EPUB**
- ✅ **Tích hợp H5P** cho nội dung tương tác
- ✅ **Tracking xAPI** để theo dõi tiến độ học tập
- ✅ **API Documentation** với Swagger
- ✅ **File upload** với Multer và validation
- ✅ **Database ORM** với Prisma

## 📋 Yêu cầu hệ thống

- Node.js >= 16.x
- PostgreSQL >= 12.x
- npm hoặc yarn

## 🛠 Cài đặt và chạy

### 1. Clone và cài đặt dependencies

```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt dependencies
npm install
```

### 2. Cấu hình Database

```bash
# Tạo file .env từ template
cp .env.example .env

# Chỉnh sửa thông tin database trong .env
DATABASE_URL="postgresql://username:password@localhost:5432/ebook_reader?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
```

### 3. Setup Database với Prisma

```bash
# Generate Prisma Client
npx prisma generate

# Chạy migration để tạo tables
npx prisma migrate dev --name init

# Seed dữ liệu mẫu
npx prisma db seed
```

### 4. Khởi chạy server

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

Server sẽ chạy tại: http://localhost:3001
API Documentation: http://localhost:3001/api

## 📁 Cấu trúc dự án

```
src/
├── auth/                 # Authentication module
│   ├── dto/             # Data Transfer Objects
│   ├── strategies/      # Passport strategies
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── users/               # User management
│   ├── dto/
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── h5p/                 # H5P content module
│   ├── dto/
│   ├── h5p.controller.ts
│   ├── h5p.service.ts
│   └── h5p.module.ts
├── epub/                # EPUB ebook module
│   ├── dto/
│   ├── epub.controller.ts
│   ├── epub.service.ts
│   └── epub.module.ts
├── tracking/            # xAPI tracking module
│   ├── dto/
│   ├── tracking.controller.ts
│   ├── tracking.service.ts
│   └── tracking.module.ts
├── common/              # Shared utilities
│   ├── decorators/      # Custom decorators
│   ├── guards/          # Auth guards
│   └── prisma.service.ts
├── app.module.ts        # Root module
└── main.ts             # Application entry point
```

## 🔐 API Endpoints

### Authentication
- `POST /auth/register` - Đăng ký người dùng
- `POST /auth/login` - Đăng nhập
- `GET /auth/profile` - Lấy thông tin profile

### Users Management
- `GET /users` - Danh sách người dùng (Admin/Teacher)
- `GET /users/:id` - Chi tiết người dùng
- `POST /users` - Tạo người dùng mới (Admin)
- `PATCH /users/:id` - Cập nhật người dùng
- `DELETE /users/:id` - Xóa người dùng (Admin)

### EPUB Management
- `GET /epub` - Danh sách sách
- `GET /epub/:id` - Chi tiết sách
- `POST /epub/upload` - Upload sách EPUB
- `GET /epub/:id/download` - Tải sách
- `DELETE /epub/:id` - Xóa sách

### H5P Content
- `GET /h5p` - Danh sách nội dung H5P
- `GET /h5p/editor/:contentId?` - Editor data
- `POST /h5p/upload` - Upload file H5P
- `GET /h5p/content/:id` - Player data

### Tracking (xAPI)
- `POST /tracking` - Gửi tracking event
- `GET /tracking` - Lấy tracking data
- `GET /tracking/analytics` - Phân tích dữ liệu
- `GET /tracking/progress/:userId` - Tiến độ người dùng

## 🗄 Database Schema

### User Model
```typescript
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  firstName String?
  lastName  String?
  role      Role     @default(STUDENT)
  isActive  Boolean  @default(true)
  // ... relationships
}
```

### Role Enum
```typescript
enum Role {
  STUDENT
  TEACHER  
  ADMIN
}
```

## 🔧 Scripts hữu ích

```bash
# Database
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run migrations
npm run prisma:studio      # Open Prisma Studio
npm run prisma:seed        # Seed database

# Development
npm run start:dev          # Start in watch mode
npm run start:debug        # Start in debug mode

# Testing
npm run test               # Run unit tests
npm run test:e2e          # Run e2e tests
npm run test:cov          # Test coverage

# Production
npm run build             # Build project
npm run start:prod        # Start production server
```

## 🔒 Bảo mật

- JWT tokens với expiration
- Password hashing với bcrypt
- Role-based access control (RBAC)
- File upload validation
- CORS configuration
- Rate limiting (có thể thêm)

## 📦 Dependencies chính

- **NestJS** - Progressive Node.js framework
- **Prisma** - Next-generation ORM  
- **PostgreSQL** - Relational database
- **Passport JWT** - Authentication
- **Multer** - File upload handling
- **class-validator** - Input validation
- **Swagger** - API documentation

## 🚀 Deployment

### Development
```bash
npm run start:dev
```

### Production với PM2
```bash
npm run build
pm2 start dist/main.js --name "ebook-backend"
```

### Docker (tùy chọn)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/main"]
```

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes  
4. Push to branch
5. Tạo Pull Request

## 📄 License

MIT License

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng tạo issue hoặc liên hệ team phát triển.

---

**Happy Coding! 🎉**
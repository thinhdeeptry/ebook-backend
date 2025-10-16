# Sample Data Generator Script

## Overview
This directory contains scripts and guides for generating comprehensive sample data for the E-Learning platform.

## Files Created

### 📋 Seed Files
- **`seed.ts`** - Main seeding script with comprehensive sample data
- **`SEEDING_GUIDE.md`** - Complete guide for database seeding
- **`db-manager.js`** - Interactive database management tool

### 🗂️ Sample Data Structure

#### Users (9 total)
```
Admin (1):
- admin@example.com / admin123

Teachers (3):
- teacher@example.com / teacher123 (John Anderson)
- sarah.wilson@example.com / teacher123 (Sarah Wilson)  
- mike.brown@example.com / teacher123 (Michael Brown)

Students (5):
- student@example.com / student123 (Jane Smith)
- alice.johnson@example.com / student123 (Alice Johnson)
- bob.miller@example.com / student123 (Robert Miller)
- emma.davis@example.com / student123 (Emma Davis)
- david.garcia@example.com / student123 (David Garcia)
```

#### Content Library
```
📚 Ebooks (5):
1. English Grammar Fundamentals (Public) - 8MB, 12 chapters
2. Mathematics for Beginners (Public) - 12MB, 15 chapters
3. World History Overview (Public) - 15MB, 20 chapters
4. Introduction to Programming (Private) - 9MB, 18 chapters
5. Science Experiments for Kids (Public) - 11MB, 10 chapters

🎮 H5P Content (5):
1. English Grammar Quiz - Multiple choice questions
2. Math Problem Solving - Arithmetic and algebra
3. Interactive Timeline: World War II - Historical events
4. Interactive Video: Programming Basics - Educational video
5. Science Laboratory Safety - Presentation slides

🎓 Courses (4):
1. Complete English Grammar Course (Published)
2. Mathematics Fundamentals (Published)
3. World History Journey (Published)  
4. Programming for Beginners (Draft)
```

#### Learning Data
```
📝 Enrollments (8):
- Students enrolled with realistic progress (25%-92%)
- Some completed courses with completion dates
- Varied enrollment dates over past 2 months

📊 Tracking Events (90+):
- Reading progress events ("experienced")
- Quiz completion events ("completed") 
- Video interaction events ("interacted")
- Realistic timestamps over past 30 days
- xAPI compliant statement structure
```

## Quick Start Commands

### 🚀 Easy Setup
```bash
# Interactive database manager (recommended)
npm run db:manage

# Quick development setup
npm run db:setup

# Complete reset with fresh data
npm run db:reset

# Open visual database browser
npm run db:studio
```

### 🔧 Manual Commands
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database only
npm run prisma:seed

# Check migration status
npm run db:status
```

## Data Features

### 🎯 Realistic Scenarios
- **Student Progress**: Varied completion rates and learning paths
- **Teacher Workload**: Content distributed among multiple teachers
- **Content Variety**: Different subjects and difficulty levels
- **Engagement Patterns**: Realistic usage timestamps and frequencies

### 📊 Analytics Ready
- **Learning Analytics**: Progress tracking and completion rates
- **Content Performance**: Usage statistics and engagement metrics
- **User Behavior**: Reading patterns and interaction data
- **Course Effectiveness**: Enrollment and completion correlations

### 🔒 Permission Testing
- **Role-based Access**: Content visibility based on user roles
- **Content Ownership**: Teachers can manage their own content
- **Privacy Controls**: Public vs private content distinction
- **Administrative Functions**: Admin-only operations

## Testing Workflows

### 👨‍🎓 Student Journey
1. Login as student@example.com
2. Browse public ebooks and courses
3. Enroll in courses and track progress
4. Take quizzes and interact with H5P content
5. View personal learning analytics

### 👨‍🏫 Teacher Workflow  
1. Login as teacher@example.com
2. View enrolled students and their progress
3. Create and manage H5P content
4. Upload new ebooks and course materials
5. Monitor learning analytics and engagement

### 👨‍💼 Admin Operations
1. Login as admin@example.com
2. Manage all users and content
3. View system-wide analytics
4. Moderate content and user activities
5. Export tracking data and reports

## File Structure
```
uploads/                    # File upload directories
├── epub/                  # EPUB files storage
│   ├── english-grammar-fundamentals.epub
│   ├── mathematics-beginners.epub
│   ├── world-history-overview.epub
│   ├── intro-programming.epub
│   └── science-experiments-kids.epub
├── h5p/                   # H5P files storage
│   ├── grammar-quiz.h5p
│   ├── math-problems.h5p
│   ├── ww2-timeline.h5p
│   ├── programming-video.h5p
│   └── lab-safety.h5p
└── covers/                # Cover images
    ├── english-grammar.jpg
    ├── mathematics.jpg
    ├── world-history.jpg
    ├── programming.jpg
    └── science-kids.jpg
```

## Customization

### Adding More Users
Edit `seed.ts` to include additional users:
```typescript
const newUser = await prisma.user.create({
  data: {
    email: 'new@example.com',
    password: await bcrypt.hash('password', 10),
    firstName: 'New',
    lastName: 'User',
    role: Role.STUDENT,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=newuser',
  },
});
```

### Adding More Content
Include additional books or H5P content in the seed arrays:
```typescript
const newEbook = {
  title: 'Advanced Physics',
  author: 'Dr. Science',
  description: 'Advanced physics concepts',
  filePath: '/uploads/epub/advanced-physics.epub',
  fileName: 'advanced-physics.epub',
  fileSize: BigInt(20000000),
  uploaderId: teacher.id,
  isPublic: true,
  // ... more fields
};
```

### Modifying Tracking Events
Adjust the tracking event generation in the loop:
```typescript
// Change event types, frequency, or data structure
for (const student of students) {
  // Generate different types of events
  // Modify score ranges, timestamps, etc.
}
```

## Production Considerations

⚠️ **IMPORTANT**: This seed script is designed for development only!

- **Never run on production**: The script deletes all existing data
- **File Paths**: Sample files are not actually created, only references
- **Performance**: Large datasets may take time to generate
- **Security**: Use strong passwords for production accounts

## Troubleshooting

### Common Issues
1. **Database Connection**: Ensure PostgreSQL is running and DATABASE_URL is correct
2. **Migration Errors**: Run `prisma migrate reset` before seeding
3. **Permission Errors**: Check file permissions for uploads directory
4. **Memory Issues**: Reduce number of tracking events for large datasets

### Getting Help
- Check `SEEDING_GUIDE.md` for detailed instructions
- Use `npm run db:manage` for interactive assistance
- Verify `.env` configuration for database connection
- Ensure all dependencies are installed with `npm install`

---

🎉 **Ready to explore your E-Learning platform with rich sample data!**
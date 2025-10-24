import { PrismaClient, Role, ProgressStatus, PageBlockType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for Vietnamese Elementary Education...');

  // Moral Education book images for Grade 1
  const moralEducationImageUrls = [
    "https://truonghocsoquocgia.nxbgd.vn/_next/image?url=https%3A%2F%2Fs3-dev.gkebooks.click%2Fbook%2F31732b0b-25b6-4ad6-9dee-d9a16eab757f%2Fdao-duc-1-12.jpg&w=1920&q=75",
    "https://truonghocsoquocgia.nxbgd.vn/_next/image?url=https%3A%2F%2Fs3-dev.gkebooks.click%2Fbook%2F31732b0b-25b6-4ad6-9dee-d9a16eab757f%2Fdao-duc-1-15.jpg&w=1920&q=75",
    "https://truonghocsoquocgia.nxbgd.vn/_next/image?url=https%3A%2F%2Fs3-dev.gkebooks.click%2Fbook%2F31732b0b-25b6-4ad6-9dee-d9a16eab757f%2Fdao-duc-1-19.jpg&w=1920&q=75",
    "https://truonghocsoquocgia.nxbgd.vn/_next/image?url=https%3A%2F%2Fs3-dev.gkebooks.click%2Fbook%2F31732b0b-25b6-4ad6-9dee-d9a16eab757f%2Fdao-duc-1-8.jpg&w=1920&q=75",
    "https://truonghocsoquocgia.nxbgd.vn/_next/image?url=https%3A%2F%2Fs3-dev.gkebooks.click%2Fbook%2F31732b0b-25b6-4ad6-9dee-d9a16eab757f%2Fdao-duc-1-2.jpg&w=1920&q=75",
    "https://truonghocsoquocgia.nxbgd.vn/_next/image?url=https%3A%2F%2Fs3-dev.gkebooks.click%2Fbook%2F31732b0b-25b6-4ad6-9dee-d9a16eab757f%2Fdao-duc-1-21.jpg&w=1920&q=75",
    "https://truonghocsoquocgia.nxbgd.vn/_next/image?url=https%3A%2F%2Fs3-dev.gkebooks.click%2Fbook%2F31732b0b-25b6-4ad6-9dee-d9a16eab757f%2Fdao-duc-1-9.jpg&w=1920&q=75",
    "https://truonghocsoquocgia.nxbgd.vn/_next/image?url=https%3A%2F%2Fs3-dev.gkebooks.click%2Fbook%2F31732b0b-25b6-4ad6-9dee-d9a16eab757f%2Fdao-duc-1-10.jpg&w=1920&q=75",
    "https://truonghocsoquocgia.nxbgd.vn/_next/image?url=https%3A%2F%2Fs3-dev.gkebooks.click%2Fbook%2F31732b0b-25b6-4ad6-9dee-d9a16eab757f%2Fdao-duc-1-13.jpg&w=1920&q=75",
    "https://truonghocsoquocgia.nxbgd.vn/_next/image?url=https%3A%2F%2Fs3-dev.gkebooks.click%2Fbook%2F31732b0b-25b6-4ad6-9dee-d9a16eab757f%2Fdao-duc-1-22.jpg&w=1920&q=75",
    "https://truonghocsoquocgia.nxbgd.vn/_next/image?url=https%3A%2F%2Fs3-dev.gkebooks.click%2Fbook%2F31732b0b-25b6-4ad6-9dee-d9a16eab757f%2Fdao-duc-1-24.jpg&w=1920&q=75",
    "https://truonghocsoquocgia.nxbgd.vn/_next/image?url=https%3A%2F%2Fs3-dev.gkebooks.click%2Fbook%2F31732b0b-25b6-4ad6-9dee-d9a16eab757f%2Fdao-duc-1-12.jpg&w=1920&q=75",
    "https://truonghocsoquocgia.nxbgd.vn/_next/image?url=https%3A%2F%2Fs3-dev.gkebooks.click%2Fbook%2F31732b0b-25b6-4ad6-9dee-d9a16eab757f%2Fdao-duc-1-15.jpg&w=1920&q=75",
    "https://truonghocsoquocgia.nxbgd.vn/_next/image?url=https%3A%2F%2Fs3-dev.gkebooks.click%2Fbook%2F31732b0b-25b6-4ad6-9dee-d9a16eab757f%2Fdao-duc-1-17.jpg&w=1920&q=75",
    "https://truonghocsoquocgia.nxbgd.vn/_next/image?url=https%3A%2F%2Fs3-dev.gkebooks.click%2Fbook%2F31732b0b-25b6-4ad6-9dee-d9a16eab757f%2Fdao-duc-1-7.jpg&w=1920&q=75",
    "https://truonghocsoquocgia.nxbgd.vn/_next/image?url=https%3A%2F%2Fs3-dev.gkebooks.click%2Fbook%2F31732b0b-25b6-4ad6-9dee-d9a16eab757f%2Fdao-duc-1-14.jpg&w=1920&q=75"
  ];

  // Clear existing data (in development only)
  console.log('🧹 Cleaning existing data...');
  await prisma.trackingEvent.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.studentProgress.deleteMany();
  await prisma.pageBlock.deleteMany();
  await prisma.page.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.h5PContent.deleteMany();
  await prisma.book.deleteMany();
  await prisma.classMembership.deleteMany();
  await prisma.class.deleteMany();
  await prisma.h5PTemporaryFile.deleteMany();
  await prisma.h5PContentLibrary.deleteMany();
  await prisma.h5PLibrary.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  console.log('👥 Creating users...');
  
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@truongtieuhoc.edu.vn',
      password: adminPassword,
      firstName: 'Quản trị',
      lastName: 'Hệ thống',
      role: Role.ADMIN,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    },
  });

  // Create teachers
  const teacherPassword = await bcrypt.hash('giaovien123', 10);
  const teachers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'co.linh@truongtieuhoc.edu.vn',
        password: teacherPassword,
        firstName: 'Nguyễn Thị',
        lastName: 'Linh',
        role: Role.TEACHER,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher1',
      },
    }),
    prisma.user.create({
      data: {
        email: 'thay.duc@truongtieuhoc.edu.vn',
        password: teacherPassword,
        firstName: 'Trần Văn',
        lastName: 'Đức',
        role: Role.TEACHER,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher2',
      },
    }),
    prisma.user.create({
      data: {
        email: 'co.mai@truongtieuhoc.edu.vn',
        password: teacherPassword,
        firstName: 'Phạm Thị',
        lastName: 'Mai',
        role: Role.TEACHER,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher3',
      },
    }),
    prisma.user.create({
      data: {
        email: 'thay.son@truongtieuhoc.edu.vn',
        password: teacherPassword,
        firstName: 'Lê Văn',
        lastName: 'Sơn',
        role: Role.TEACHER,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher4',
      },
    }),
    prisma.user.create({
      data: {
        email: 'co.hoa@truongtieuhoc.edu.vn',
        password: teacherPassword,
        firstName: 'Đỗ Thị',
        lastName: 'Hoa',
        role: Role.TEACHER,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher5',
      },
    }),
  ]);

  // Create students for each grade (5 students per grade = 25 total students)
  const studentPassword = await bcrypt.hash('hocsinh123', 10);
  const allStudents = [];
  
  const studentNames = [
    // Grade 1 students
    { firstName: 'Nguyễn Minh', lastName: 'An', email: 'minh.an.1@hocsinh.edu.vn' },
    { firstName: 'Trần Thị', lastName: 'Bình', email: 'thi.binh.1@hocsinh.edu.vn' },
    { firstName: 'Lê Văn', lastName: 'Cường', email: 'van.cuong.1@hocsinh.edu.vn' },
    { firstName: 'Phạm Thị', lastName: 'Dung', email: 'thi.dung.1@hocsinh.edu.vn' },
    { firstName: 'Hoàng Minh', lastName: 'Em', email: 'minh.em.1@hocsinh.edu.vn' },
    
    // Grade 2 students
    { firstName: 'Đỗ Văn', lastName: 'Phát', email: 'van.phat.2@hocsinh.edu.vn' },
    { firstName: 'Nguyễn Thị', lastName: 'Giang', email: 'thi.giang.2@hocsinh.edu.vn' },
    { firstName: 'Trần Minh', lastName: 'Hải', email: 'minh.hai.2@hocsinh.edu.vn' },
    { firstName: 'Lê Thị', lastName: 'Inh', email: 'thi.inh.2@hocsinh.edu.vn' },
    { firstName: 'Phạm Văn', lastName: 'Khánh', email: 'van.khanh.2@hocsinh.edu.vn' },
    
    // Grade 3 students
    { firstName: 'Hoàng Thị', lastName: 'Lan', email: 'thi.lan.3@hocsinh.edu.vn' },
    { firstName: 'Đỗ Minh', lastName: 'Minh', email: 'minh.minh.3@hocsinh.edu.vn' },
    { firstName: 'Nguyễn Văn', lastName: 'Nam', email: 'van.nam.3@hocsinh.edu.vn' },
    { firstName: 'Trần Thị', lastName: 'Oanh', email: 'thi.oanh.3@hocsinh.edu.vn' },
    { firstName: 'Lê Minh', lastName: 'Phúc', email: 'minh.phuc.3@hocsinh.edu.vn' },
    
    // Grade 4 students
    { firstName: 'Phạm Thị', lastName: 'Quỳnh', email: 'thi.quynh.4@hocsinh.edu.vn' },
    { firstName: 'Hoàng Văn', lastName: 'Rộng', email: 'van.rong.4@hocsinh.edu.vn' },
    { firstName: 'Đỗ Thị', lastName: 'Sáng', email: 'thi.sang.4@hocsinh.edu.vn' },
    { firstName: 'Nguyễn Minh', lastName: 'Tuấn', email: 'minh.tuan.4@hocsinh.edu.vn' },
    { firstName: 'Trần Thị', lastName: 'Uyên', email: 'thi.uyen.4@hocsinh.edu.vn' },
    
    // Grade 5 students
    { firstName: 'Lê Văn', lastName: 'Việt', email: 'van.viet.5@hocsinh.edu.vn' },
    { firstName: 'Phạm Thị', lastName: 'Xuân', email: 'thi.xuan.5@hocsinh.edu.vn' },
    { firstName: 'Hoàng Minh', lastName: 'Yên', email: 'minh.yen.5@hocsinh.edu.vn' },
    { firstName: 'Đỗ Văn', lastName: 'Zung', email: 'van.zung.5@hocsinh.edu.vn' },
    { firstName: 'Nguyễn Thị', lastName: 'Ánh', email: 'thi.anh.5@hocsinh.edu.vn' },
  ];

  for (const studentData of studentNames) {
    const student = await prisma.user.create({
      data: {
        email: studentData.email,
        password: studentPassword,
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        role: Role.STUDENT,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${studentData.email}`,
      },
    });
    allStudents.push(student);
  }

  // Create Classes (Lớp 1-5)
  console.log('🏫 Creating classes for grades 1-5...');
  const classes = await Promise.all([
    prisma.class.create({
      data: {
        name: 'Lớp 1',
        gradeLevel: 1,
        description: 'Lớp học dành cho học sinh 6-7 tuổi, làm quen với chữ cái và số đếm cơ bản',
      },
    }),
    prisma.class.create({
      data: {
        name: 'Lớp 2',
        gradeLevel: 2,
        description: 'Lớp học dành cho học sinh 7-8 tuổi, phát triển kỹ năng đọc viết và tính toán',
      },
    }),
    prisma.class.create({
      data: {
        name: 'Lớp 3',
        gradeLevel: 3,
        description: 'Lớp học dành cho học sinh 8-9 tuổi, mở rộng kiến thức và kỹ năng tư duy',
      },
    }),
    prisma.class.create({
      data: {
        name: 'Lớp 4',
        gradeLevel: 4,
        description: 'Lớp học dành cho học sinh 9-10 tuổi, củng cố kiến thức nền tảng',
      },
    }),
    prisma.class.create({
      data: {
        name: 'Lớp 5',
        gradeLevel: 5,
        description: 'Lớp học dành cho học sinh 10-11 tuổi, chuẩn bị lên cấp trung học cơ sở',
      },
    }),
  ]);

  // Create Class Memberships (assign students to classes)
  console.log('📝 Creating class memberships...');
  const classMemberships = [];
  for (let i = 0; i < allStudents.length; i++) {
    const student = allStudents[i];
    const gradeIndex = Math.floor(i / 5); // 5 students per grade
    const classToJoin = classes[gradeIndex];
    
    const membership = await prisma.classMembership.create({
      data: {
        userId: student.id,
        classId: classToJoin.id,
      },
    });
    classMemberships.push(membership);
  }

  // Create H5P Libraries first
  console.log('📚 Creating H5P libraries...');
  const h5pLibraries = await Promise.all([
    prisma.h5PLibrary.create({
      data: {
        machineName: 'H5P.MultiChoice',
        majorVersion: 1,
        minorVersion: 16,
        patchVersion: 0,
        title: 'Multiple Choice',
        description: 'Create flexible multiple choice questions',
        author: 'Joubel',
        license: 'MIT',
        libraryJson: {
          title: 'Multiple Choice',
          machineName: 'H5P.MultiChoice',
          majorVersion: 1,
          minorVersion: 16,
          patchVersion: 0
        },
        semanticsJson: {
          name: 'question',
          type: 'text',
          label: 'Question'
        },
      },
    }),
    prisma.h5PLibrary.create({
      data: {
        machineName: 'H5P.QuestionSet',
        majorVersion: 1,
        minorVersion: 20,
        patchVersion: 0,
        title: 'Question Set',
        description: 'Create a sequence of various question types',
        author: 'Joubel',
        license: 'MIT',
        libraryJson: {
          title: 'Question Set',
          machineName: 'H5P.QuestionSet',
          majorVersion: 1,
          minorVersion: 20,
          patchVersion: 0
        },
        semanticsJson: {
          name: 'questions',
          type: 'list',
          label: 'Questions'
        },
      },
    }),
    prisma.h5PLibrary.create({
      data: {
        machineName: 'H5P.InteractiveVideo',
        majorVersion: 1,
        minorVersion: 26,
        patchVersion: 0,
        title: 'Interactive Video',
        description: 'Create videos enriched with interactions',
        author: 'Joubel',
        license: 'MIT',
        libraryJson: {
          title: 'Interactive Video',
          machineName: 'H5P.InteractiveVideo',
          majorVersion: 1,
          minorVersion: 26,
          patchVersion: 0
        },
        semanticsJson: {
          name: 'video',
          type: 'video',
          label: 'Video'
        },
      },
    }),
  ]);

  // Create H5P Content
  console.log('🎮 Creating H5P interactive content...');
  const h5pContents = await Promise.all([
    // Grade 1 H5P Content
    prisma.h5PContent.create({
      data: {
        title: 'Nhận biết chữ cái A-M',
        library: 'H5P.MultiChoice',
        uploaderId: teachers[0].id,
        isPublic: true,
        params: {
          question: 'Chữ cái nào đứng sau chữ B?',
          answers: [
            { text: 'C', correct: true, feedback: 'Đúng rồi! C đứng sau B.' },
            { text: 'A', correct: false, feedback: 'A đứng trước B nhé!' },
            { text: 'D', correct: false, feedback: 'D đứng sau C nhé!' }
          ]
        },
        metadata: {
          title: 'Nhận biết chữ cái A-M',
          language: 'vi',
          subject: 'Tiếng Việt',
          grade: 1
        },
      },
    }),
    
    prisma.h5PContent.create({
      data: {
        title: 'Đếm số từ 1 đến 10',
        library: 'H5P.QuestionSet',
        uploaderId: teachers[1].id,
        isPublic: true,
        params: {
          questions: [
            {
              question: 'Có bao nhiêu quả táo trong hình?',
              answers: [
                { text: '5', correct: true, feedback: 'Đúng rồi! Có 5 quả táo.' },
                { text: '4', correct: false, feedback: 'Hãy đếm lại nhé!' },
                { text: '6', correct: false, feedback: 'Hãy đếm lại nhé!' }
              ]
            }
          ]
        },
        metadata: {
          title: 'Đếm số từ 1 đến 10',
          language: 'vi',
          subject: 'Toán',
          grade: 1
        },
      },
    }),

    // Grade 2 H5P Content
    prisma.h5PContent.create({
      data: {
        title: 'Phép cộng trong phạm vi 20',
        library: 'H5P.QuestionSet',
        uploaderId: teachers[1].id,
        isPublic: true,
        params: {
          questions: [
            {
              question: 'Tính: 12 + 5 = ?',
              answers: [
                { text: '17', correct: true, feedback: 'Chính xác! 12 + 5 = 17' },
                { text: '16', correct: false, feedback: 'Hãy tính lại nhé!' },
                { text: '18', correct: false, feedback: 'Hãy tính lại nhé!' }
              ]
            }
          ]
        },
        metadata: {
          title: 'Phép cộng trong phạm vi 20',
          language: 'vi',
          subject: 'Toán',
          grade: 2
        },
      },
    }),

    // Grade 3 H5P Content
    prisma.h5PContent.create({
      data: {
        title: 'Bảng cửu chương 2 và 3',
        library: 'H5P.QuestionSet',
        uploaderId: teachers[1].id,
        isPublic: true,
        params: {
          questions: [
            {
              question: '3 x 4 = ?',
              answers: [
                { text: '12', correct: true, feedback: 'Đúng rồi! 3 x 4 = 12' },
                { text: '10', correct: false, feedback: 'Hãy nhớ lại bảng cửu chương 3 nhé!' },
                { text: '14', correct: false, feedback: 'Hãy nhớ lại bảng cửu chương 3 nhé!' }
              ]
            }
          ]
        },
        metadata: {
          title: 'Bảng cửu chương 2 và 3',
          language: 'vi',
          subject: 'Toán',
          grade: 3
        },
      },
    }),

    // Grade 4 H5P Content
    prisma.h5PContent.create({
      data: {
        title: 'Phép chia có dư',
        library: 'H5P.QuestionSet',
        uploaderId: teachers[1].id,
        isPublic: true,
        params: {
          questions: [
            {
              question: '25 : 4 = ? (thương bao nhiêu, dư bao nhiêu?)',
              answers: [
                { text: 'Thương 6, dư 1', correct: true, feedback: 'Chính xác! 25 : 4 = 6 dư 1' },
                { text: 'Thương 6, dư 2', correct: false, feedback: 'Hãy kiểm tra lại phép tính!' },
                { text: 'Thương 5, dư 5', correct: false, feedback: 'Hãy kiểm tra lại phép tính!' }
              ]
            }
          ]
        },
        metadata: {
          title: 'Phép chia có dư',
          language: 'vi',
          subject: 'Toán',
          grade: 4
        },
      },
    }),

    // Grade 5 H5P Content
    prisma.h5PContent.create({
      data: {
        title: 'Phân số cơ bản',
        library: 'H5P.QuestionSet',
        uploaderId: teachers[1].id,
        isPublic: true,
        params: {
          questions: [
            {
              question: 'Phân số 2/4 bằng phân số nào sau đây?',
              answers: [
                { text: '1/2', correct: true, feedback: 'Đúng rồi! 2/4 = 1/2' },
                { text: '3/6', correct: false, feedback: 'Hãy rút gọn phân số xem!' },
                { text: '4/8', correct: false, feedback: 'Đây cũng bằng 1/2, nhưng chưa phải đáp án đơn giản nhất!' }
              ]
            }
          ]
        },
        metadata: {
          title: 'Phân số cơ bản',
          language: 'vi',
          subject: 'Toán',
          grade: 5
        },
      },
    }),
  ]);

  // Create Books for each grade and subject
  console.log('📖 Creating books for each grade...');
  const books = [];
  
  for (let grade = 1; grade <= 5; grade++) {
    const gradeClass = classes[grade - 1];
    
    // Math book for each grade
    const mathBook = await prisma.book.create({
      data: {
        title: `Sách giáo khoa Toán lớp ${grade}`,
        subject: 'Toán học',
        grade: grade,
        description: `Sách giáo khoa Toán học dành cho học sinh lớp ${grade}, phù hợp với độ tuổi ${grade + 5}-${grade + 6}`,
        publisher: 'Nhà xuất bản Giáo dục Việt Nam',
        isPublished: true,
        classes: {
          connect: [{ id: gradeClass.id }]
        }
      },
    });
    books.push(mathBook);

    // Vietnamese book for each grade
    const vietnameseBook = await prisma.book.create({
      data: {
        title: `Sách giáo khoa Tiếng Việt lớp ${grade}`,
        subject: 'Tiếng Việt',
        grade: grade,
        description: `Sách giáo khoa Tiếng Việt dành cho học sinh lớp ${grade}, phát triển kỹ năng đọc viết`,
        publisher: 'Nhà xuất bản Giáo dục Việt Nam',
        isPublished: true,
        classes: {
          connect: [{ id: gradeClass.id }]
        }
      },
    });
    books.push(vietnameseBook);

    // Science book for grades 3-5
    if (grade >= 3) {
      const scienceBook = await prisma.book.create({
        data: {
          title: `Sách giáo khoa Khoa học lớp ${grade}`,
          subject: 'Khoa học tự nhiên',
          grade: grade,
          description: `Sách giáo khoa Khoa học tự nhiên dành cho học sinh lớp ${grade}`,
          publisher: 'Nhà xuất bản Giáo dục Việt Nam',
          isPublished: true,
          classes: {
            connect: [{ id: gradeClass.id }]
          }
        },
      });
      books.push(scienceBook);
    }

    // Animal World book for grade 1 only
    if (grade === 1) {
      const animalWorldBook = await prisma.book.create({
        data: {
          title: `Sách giáo khoa Thế giới động vật lớp ${grade}`,
          subject: 'Thế giới động vật',
          grade: grade,
          description: `Khám phá thế giới động vật đầy màu sắc dành cho học sinh lớp ${grade}, giúp các em làm quen với các loài động vật quen thuộc`,
          publisher: 'Nhà xuất bản Giáo dục Việt Nam',
          isPublished: true,
          classes: {
            connect: [{ id: gradeClass.id }]
          }
        },
      });
      books.push(animalWorldBook);

      // Moral Education book for grade 1 only
      const moralEducationBook = await prisma.book.create({
        data: {
          title: `Sách giáo khoa Đạo đức lớp ${grade}`,
          subject: 'Đạo đức',
          grade: grade,
          description: `Sách giáo khoa Đạo đức dành cho học sinh lớp ${grade}, giúp các em hình thành nhân cách và phẩm chất tốt đẹp`,
          publisher: 'Nhà xuất bản Giáo dục Việt Nam',
          isPublished: true,
          classes: {
            connect: [{ id: gradeClass.id }]
          }
        },
      });
      books.push(moralEducationBook);
    }
  }

  // Create Chapters and Lessons
  console.log('📚 Creating chapters and lessons...');
  const lessons = [];
  
  for (const book of books) {
    // Create chapters for each book
    const chapter1 = await prisma.chapter.create({
      data: {
        title: 'Chương 1: Những kiến thức cơ bản',
        order: 1,
        bookId: book.id,
        description: `Chương đầu tiên của ${book.title}`
      }
    });

    const chapter2 = await prisma.chapter.create({
      data: {
        title: 'Chương 2: Nâng cao kỹ năng',
        order: 2,
        bookId: book.id,
        description: `Chương thứ hai của ${book.title}`
      }
    });

    // Create lessons for each chapter
    if (book.subject === 'Toán học') {
      // Math lessons
      const mathLesson1 = await prisma.lesson.create({
        data: {
          title: book.grade === 1 ? 'Bài 1: Đếm từ 1 đến 5' : 
                book.grade === 2 ? 'Bài 1: Số và chữ số trong phạm vi 20' :
                'Bài 1: Ôn tập kiến thức cũ',
          description: book.grade === 1 ? 'Học cách đếm và nhận biết các số từ 1 đến 5' :
                      book.grade === 2 ? 'Ôn tập và mở rộng kiến thức về số' :
                      'Ôn tập những kiến thức đã học',
          order: 1,
          chapterId: chapter1.id,
          bookId: book.id,
        },
      });
      lessons.push(mathLesson1);

      const mathLesson2 = await prisma.lesson.create({
        data: {
          title: book.grade === 1 ? 'Bài 2: Đếm từ 6 đến 10' :
                book.grade === 2 ? 'Bài 2: Phép cộng không nhớ' :
                'Bài 2: Kiến thức mới',
          description: book.grade === 1 ? 'Mở rộng khả năng đếm từ 6 đến 10' :
                      book.grade === 2 ? 'Thực hiện phép cộng trong phạm vi 20' :
                      'Học các kiến thức mới',
          order: 2,
          chapterId: chapter1.id,
          bookId: book.id,
        },
      });
      lessons.push(mathLesson2);
    } else if (book.subject === 'Tiếng Việt') {
      // Vietnamese lessons
      const vnLesson1 = await prisma.lesson.create({
        data: {
          title: 'Bài 1: Chữ cái đầu tiên',
          description: 'Học các chữ cái đầu tiên trong bảng chữ cái',
          order: 1,
          chapterId: chapter1.id,
          bookId: book.id,
        },
      });
      lessons.push(vnLesson1);
    } else if (book.subject === 'Thế giới động vật') {
      // Animal World lessons
      const animalLesson1 = await prisma.lesson.create({
        data: {
          title: 'Bài 1: Những con vật gần gũi',
          description: 'Làm quen với các con vật thường gặp xung quanh chúng ta như chó, mèo, gà, vịt',
          order: 1,
          chapterId: chapter1.id,
          bookId: book.id,
        },
      });
      lessons.push(animalLesson1);

      const animalLesson2 = await prisma.lesson.create({
        data: {
          title: 'Bài 2: Động vật trong rừng',
          description: 'Khám phá những con vật sống trong rừng như thỏ, sóc, hổ, voi',
          order: 2,
          chapterId: chapter1.id,
          bookId: book.id,
        },
      });
      lessons.push(animalLesson2);
    } else if (book.subject === 'Đạo đức') {
      // Moral Education lessons
      const moralLesson1 = await prisma.lesson.create({
        data: {
          title: 'Bài 1: Em yêu gia đình',
          description: 'Giúp các em hiểu về tình yêu thương gia đình, biết kính trọng và yêu quý cha mẹ, ông bà',
          order: 1,
          chapterId: chapter1.id,
          bookId: book.id,
        },
      });
      lessons.push(moralLesson1);

      const moralLesson2 = await prisma.lesson.create({
        data: {
          title: 'Bài 2: Em yêu trường lớp',
          description: 'Giúp các em biết yêu quý thầy cô, bạn bè và trường lớp, có ý thức giữ gìn vệ sinh',
          order: 2,
          chapterId: chapter1.id,
          bookId: book.id,
        },
      });
      lessons.push(moralLesson2);

      const moralLesson3 = await prisma.lesson.create({
        data: {
          title: 'Bài 3: Em biết chào hỏi',
          description: 'Dạy các em cách chào hỏi lịch sự, biết nói lời cảm ơn và xin lỗi khi cần thiết',
          order: 3,
          chapterId: chapter2.id,
          bookId: book.id,
        },
      });
      lessons.push(moralLesson3);

      const moralLesson4 = await prisma.lesson.create({
        data: {
          title: 'Bài 4: Em biết giúp đỡ bạn bè',
          description: 'Giúp các em hiểu tầm quan trọng của việc giúp đỡ lẫn nhau, chia sẻ và quan tâm đến bạn bè',
          order: 4,
          chapterId: chapter2.id,
          bookId: book.id,
        },
      });
      lessons.push(moralLesson4);

      const moralLesson5 = await prisma.lesson.create({
        data: {
          title: 'Bài 5: Em biết giữ gìn đồ chơi',
          description: 'Dạy các em cách bảo quản đồ chơi, sách vở và đồ dùng học tập',
          order: 5,
          chapterId: chapter2.id,
          bookId: book.id,
        },
      });
      lessons.push(moralLesson5);
    }
  }

  // Create Pages and PageBlocks for each lesson
  console.log('📄 Creating pages and page blocks...');
  const pageBlocks = [];
  let moralEducationImageIndex = 0; // Track which image to use next
  
  for (const lesson of lessons) {
    // Determine if this is a moral education lesson to assign images
    const isMoralEducation = lesson.title.includes('Em yêu gia đình') || 
                             lesson.title.includes('Em yêu trường lớp') || 
                             lesson.title.includes('Em biết chào hỏi') || 
                             lesson.title.includes('Em biết giúp đỡ') || 
                             lesson.title.includes('Em biết giữ gìn');

    // Create pages for each lesson
    const introPage = await prisma.page.create({
      data: {
        lessonId: lesson.id,
        order: 1,
        title: 'Trang giới thiệu',
        layout: 'one-column',
        imageUrl: isMoralEducation && moralEducationImageIndex < moralEducationImageUrls.length 
          ? moralEducationImageUrls[moralEducationImageIndex++] 
          : undefined
      }
    });

    const contentPage = await prisma.page.create({
      data: {
        lessonId: lesson.id,
        order: 2,
        title: 'Trang nội dung chính',
        layout: 'two-column',
        imageUrl: isMoralEducation && moralEducationImageIndex < moralEducationImageUrls.length 
          ? moralEducationImageUrls[moralEducationImageIndex++] 
          : undefined
      }
    });

    const practePage = await prisma.page.create({
      data: {
        lessonId: lesson.id,
        order: 3,
        title: 'Trang thực hành',
        layout: 'one-column',
        imageUrl: isMoralEducation && moralEducationImageIndex < moralEducationImageUrls.length 
          ? moralEducationImageUrls[moralEducationImageIndex++] 
          : undefined
      }
    });

    // Create page blocks for intro page
    const textBlock1 = await prisma.pageBlock.create({
      data: {
        pageId: introPage.id,
        order: 1,
        blockType: PageBlockType.TEXT,
        contentJson: {
          markdown: `# ${lesson.title}\n\n${lesson.description}\n\nTrong bài học này, các em sẽ học được những kiến thức quan trọng và thú vị. Hãy cùng bắt đầu nhé!`
        },
        x: 50,      // Tọa độ X - vị trí từ trái sang phải (pixel)
        y: 100,     // Tọa độ Y - vị trí từ trên xuống dưới (pixel)
        width: 700, // Chiều rộng block
        height: 200 // Chiều cao block
      }
    });
    pageBlocks.push(textBlock1);

    // Create page blocks for content page
    const imageBlock = await prisma.pageBlock.create({
      data: {
        pageId: contentPage.id,
        order: 1,
        blockType: PageBlockType.IMAGE,
        contentJson: {
          imageUrl: 'https://via.placeholder.com/400x300',
          alt: 'Hình minh họa bài học',
          caption: 'Hình minh họa cho bài học'
        },
        x: 50,      // Cột trái trong layout two-column
        y: 50,      
        width: 350, 
        height: 250
      }
    });
    pageBlocks.push(imageBlock);

    const textBlock2 = await prisma.pageBlock.create({
      data: {
        pageId: contentPage.id,
        order: 2,
        blockType: PageBlockType.TEXT,
        contentJson: {
          markdown: `## Nội dung bài học\n\nĐây là nội dung chi tiết của bài học...`
        },
        x: 450,     // Cột phải trong layout two-column
        y: 50,      
        width: 350, 
        height: 300
      }
    });
    pageBlocks.push(textBlock2);

    // Create H5P block for practice page (if relevant H5P content exists)
    let relevantH5P;
    
    // Find appropriate H5P content based on lesson subject
    if (lesson.title.includes('con vật')) {
      relevantH5P = h5pContents.find(content => 
        content.metadata && 
        JSON.parse(JSON.stringify(content.metadata)).subject === 'Thế giới động vật'
      );
    } else if (lesson.title.includes('Toán') || lesson.title.includes('Đếm') || lesson.title.includes('số')) {
      relevantH5P = h5pContents.find(content => 
        content.metadata && 
        JSON.parse(JSON.stringify(content.metadata)).subject === 'Toán'
      );
    } else if (lesson.title.includes('chữ cái')) {
      relevantH5P = h5pContents.find(content => 
        content.metadata && 
        JSON.parse(JSON.stringify(content.metadata)).subject === 'Tiếng Việt'
      );
    }

    if (relevantH5P) {
      const h5pBlock = await prisma.pageBlock.create({
        data: {
          pageId: practePage.id,
          order: 1,
          blockType: PageBlockType.H5P,
          h5pContentId: relevantH5P.id,
          x: 50,      // Vị trí trung tâm trang thực hành
          y: 100,     
          width: 700, 
          height: 400
        }
      });
      pageBlocks.push(h5pBlock);
    } else {
      // Create a text block instead
      const practiceTextBlock = await prisma.pageBlock.create({
        data: {
          pageId: practePage.id,
          order: 1,
          blockType: PageBlockType.TEXT,
          contentJson: {
            markdown: `## Bài tập thực hành\n\nCác em hãy thực hiện các bài tập để luyện tập kiến thức đã học.`
          },
          x: 50,      // Vị trí trung tâm trang thực hành
          y: 100,     
          width: 700, 
          height: 200
        }
      });
      pageBlocks.push(practiceTextBlock);
    }
  }

  // Create Student Progress
  console.log('📊 Creating student progress...');
  const studentProgress = [];
  
  for (let i = 0; i < allStudents.length; i++) {
    const student = allStudents[i];
    const gradeIndex = Math.floor(i / 5);
    
    // Get page blocks for the student's grade
    const studentPageBlocks = pageBlocks.filter(block => {
      // Find the page this block belongs to
      // This is a simplified approach - in real implementation, 
      // you'd need to traverse page -> lesson -> book -> class to check grade
      return Math.random() < 0.3; // Randomly assign some progress
    });

    // Create progress for some page blocks (simulate partial completion)
    for (let j = 0; j < Math.min(studentPageBlocks.length, 3); j++) {
      const block = studentPageBlocks[j];
      const status = j === 0 ? ProgressStatus.COMPLETED : 
                    j === 1 ? ProgressStatus.IN_PROGRESS : 
                    ProgressStatus.NOT_STARTED;
      
      const progress = await prisma.studentProgress.create({
        data: {
          userId: student.id,
          pageBlockId: block.id,
          status: status,
          completedAt: status === ProgressStatus.COMPLETED ? new Date() : null,
        },
      });
      studentProgress.push(progress);

      // Create quiz attempts for completed H5P blocks
      if (status === ProgressStatus.COMPLETED && block.blockType === PageBlockType.H5P) {
        await prisma.quizAttempt.create({
          data: {
            studentProgressId: progress.id,
            attemptNumber: 1,
            score: 80 + Math.random() * 20, // Random score between 80-100
            isPass: true,
            statement: {
              score: {
                scaled: 0.85
              }
            }
          },
        });
      }
    }
  }

  // Create sample tracking events
  console.log('📈 Creating tracking events...');
  const now = new Date();
  
  for (const student of allStudents.slice(0, 10)) { // Create events for first 10 students
    for (let i = 0; i < 5; i++) {
      const randomH5P = h5pContents[Math.floor(Math.random() * h5pContents.length)];
      
      await prisma.trackingEvent.create({
        data: {
          actorId: student.id,
          verb: 'completed',
          objectId: `h5p-${randomH5P.id}`,
          contentId: randomH5P.id,
          statement: {
            actor: {
              name: `${student.firstName} ${student.lastName}`,
              mbox: `mailto:${student.email}`
            },
            verb: {
              id: 'http://adlnet.gov/expapi/verbs/completed',
              display: { 'vi-VN': 'hoàn thành', 'en-US': 'completed' }
            },
            object: {
              id: randomH5P.id,
              definition: {
                name: { 'vi-VN': randomH5P.title },
                description: { 'vi-VN': 'Bài tập tương tác H5P' }
              }
            }
          },
          result: {
            score: {
              scaled: 0.8 + Math.random() * 0.2 // 80-100%
            },
            completion: true,
            success: true,
            duration: `PT${Math.floor(Math.random() * 10) + 5}M`
          },
          context: {
            platform: 'Hệ thống học tập tiểu học',
            language: 'vi-VN'
          },
          timestamp: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last 7 days
        },
      });
    }
  }

  console.log('✅ Vietnamese Elementary Education seed data created successfully!');
  console.log('\n📊 Summary:');
  console.log(`👤 Users: ${1 + teachers.length + allStudents.length} (1 admin, ${teachers.length} teachers, ${allStudents.length} students)`);
  console.log(`🏫 Classes: ${classes.length} (Grades 1-5)`);
  console.log(`📚 Class Memberships: ${classMemberships.length}`);
  console.log(`📖 Books: ${books.length} (Math, Vietnamese, Science, Animal World by grade)`);
  console.log(`📚 Lessons: ${lessons.length}`);
  console.log(`� Page Blocks: ${pageBlocks.length}`);
  console.log(`🎮 H5P Content: ${h5pContents.length}`);
  console.log(`📊 Student Progress Records: ${studentProgress.length}`);
  
  console.log('\n🔐 Login Credentials:');
  console.log('Admin: admin@truongtieuhoc.edu.vn / admin123');
  console.log('Teachers: ');
  console.log('  - co.linh@truongtieuhoc.edu.vn / giaovien123');
  console.log('  - thay.duc@truongtieuhoc.edu.vn / giaovien123');
  console.log('  - co.mai@truongtieuhoc.edu.vn / giaovien123');
  console.log('  - thay.son@truongtieuhoc.edu.vn / giaovien123');
  console.log('  - co.hoa@truongtieuhoc.edu.vn / giaovien123');
  console.log('Students (sample): ');
  console.log('  - minh.an.1@hocsinh.edu.vn / hocsinh123 (Grade 1)');
  console.log('  - van.phat.2@hocsinh.edu.vn / hocsinh123 (Grade 2)');
  console.log('  - thi.lan.3@hocsinh.edu.vn / hocsinh123 (Grade 3)');
  console.log('  - thi.quynh.4@hocsinh.edu.vn / hocsinh123 (Grade 4)');
  console.log('  - van.viet.5@hocsinh.edu.vn / hocsinh123 (Grade 5)');
  
  console.log('\n🎯 New Educational Structure:');
  console.log('📚 Each grade has Books for different subjects');
  console.log('📖 Each Book has Chapters containing Lessons');
  console.log('� Each Lesson has Pages with multiple PageBlocks');
  console.log('🧱 PageBlocks contain different content types (Text, Image, Video, H5P)');
  console.log('� Student progress is tracked at the PageBlock level');
  console.log('🎮 H5P content provides interactive learning experiences');
  console.log('🏆 Quiz attempts and xAPI events capture detailed learning analytics');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
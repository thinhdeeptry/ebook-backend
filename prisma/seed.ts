import { PrismaClient, Role, LessonStepType, ProgressStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for Vietnamese Elementary Education...');

  // Clear existing data (in development only)
  console.log('🧹 Cleaning existing data...');
  await prisma.trackingEvent.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.studentProgress.deleteMany();
  await prisma.lessonStep.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.h5PContent.deleteMany();
  await prisma.course.deleteMany();
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

  // Create Courses for each grade and subject
  console.log('📖 Creating courses for each grade...');
  const courses = [];
  
  for (let grade = 1; grade <= 5; grade++) {
    const gradeClass = classes[grade - 1];
    
    // Math course for each grade
    const mathCourse = await prisma.course.create({
      data: {
        title: `Toán học lớp ${grade}`,
        description: `Chương trình Toán học dành cho học sinh lớp ${grade}, phù hợp với độ tuổi ${grade + 5}-${grade + 6}`,
        classId: gradeClass.id,
        isPublished: true,
      },
    });
    courses.push(mathCourse);

    // Vietnamese course for each grade
    const vietnameseCourse = await prisma.course.create({
      data: {
        title: `Tiếng Việt lớp ${grade}`,
        description: `Chương trình Tiếng Việt dành cho học sinh lớp ${grade}, phát triển kỹ năng đọc viết`,
        classId: gradeClass.id,
        isPublished: true,
      },
    });
    courses.push(vietnameseCourse);

    // Science course for grades 3-5
    if (grade >= 3) {
      const scienceCourse = await prisma.course.create({
        data: {
          title: `Khoa học lớp ${grade}`,
          description: `Chương trình Khoa học tự nhiên dành cho học sinh lớp ${grade}`,
          classId: gradeClass.id,
          isPublished: true,
        },
      });
      courses.push(scienceCourse);
    }

    // English course for grades 3-5
    if (grade >= 3) {
      const englishCourse = await prisma.course.create({
        data: {
          title: `Tiếng Anh lớp ${grade}`,
          description: `Chương trình Tiếng Anh cơ bản dành cho học sinh lớp ${grade}`,
          classId: gradeClass.id,
          isPublished: true,
        },
      });
      courses.push(englishCourse);
    }

    // Animal World course for grade 1 only
    if (grade === 1) {
      const animalWorldCourse = await prisma.course.create({
        data: {
          title: `Thế giới động vật lớp ${grade}`,
          description: `Khám phá thế giới động vật đầy màu sắc dành cho học sinh lớp ${grade}, giúp các em làm quen với các loài động vật quen thuộc`,
          classId: gradeClass.id,
          isPublished: true,
        },
      });
      courses.push(animalWorldCourse);
    }
  }

  // Create Lessons for each course
  console.log('📚 Creating lessons for each course...');
  const lessons = [];
  
  // Grade 1 Math Lessons
  const grade1MathCourse = courses.find(c => c.title === 'Toán học lớp 1');
  if (grade1MathCourse) {
    const mathLessons1 = await Promise.all([
      prisma.lesson.create({
        data: {
          title: 'Bài 1: Đếm từ 1 đến 5',
          description: 'Học cách đếm và nhận biết các số từ 1 đến 5',
          order: 1,
          courseId: grade1MathCourse.id,
        },
      }),
      prisma.lesson.create({
        data: {
          title: 'Bài 2: Đếm từ 6 đến 10',
          description: 'Mở rộng khả năng đếm từ 6 đến 10',
          order: 2,
          courseId: grade1MathCourse.id,
        },
      }),
      prisma.lesson.create({
        data: {
          title: 'Bài 3: Phép cộng đơn giản',
          description: 'Làm quen với phép cộng trong phạm vi 5',
          order: 3,
          courseId: grade1MathCourse.id,
        },
      }),
    ]);
    lessons.push(...mathLessons1);
  }

  // Grade 1 Vietnamese Lessons
  const grade1VietnameseCourse = courses.find(c => c.title === 'Tiếng Việt lớp 1');
  if (grade1VietnameseCourse) {
    const vietnameseLessons1 = await Promise.all([
      prisma.lesson.create({
        data: {
          title: 'Bài 1: Chữ cái A, Ă, Â',
          description: 'Nhận biết và viết các chữ cái A, Ă, Â',
          order: 1,
          courseId: grade1VietnameseCourse.id,
        },
      }),
      prisma.lesson.create({
        data: {
          title: 'Bài 2: Chữ cái B, C, D',
          description: 'Học các phụ âm đầu tiên',
          order: 2,
          courseId: grade1VietnameseCourse.id,
        },
      }),
    ]);
    lessons.push(...vietnameseLessons1);
  }

  // Grade 2 Math Lessons
  const grade2MathCourse = courses.find(c => c.title === 'Toán học lớp 2');
  if (grade2MathCourse) {
    const mathLessons2 = await Promise.all([
      prisma.lesson.create({
        data: {
          title: 'Bài 1: Số và chữ số trong phạm vi 20',
          description: 'Ôn tập và mở rộng kiến thức về số',
          order: 1,
          courseId: grade2MathCourse.id,
        },
      }),
      prisma.lesson.create({
        data: {
          title: 'Bài 2: Phép cộng không nhớ',
          description: 'Thực hiện phép cộng trong phạm vi 20',
          order: 2,
          courseId: grade2MathCourse.id,
        },
      }),
    ]);
    lessons.push(...mathLessons2);
  }

  // Grade 3 Math Lessons
  const grade3MathCourse = courses.find(c => c.title === 'Toán học lớp 3');
  if (grade3MathCourse) {
    const mathLessons3 = await Promise.all([
      prisma.lesson.create({
        data: {
          title: 'Bài 1: Bảng cửu chương 2',
          description: 'Học thuộc bảng cửu chương 2',
          order: 1,
          courseId: grade3MathCourse.id,
        },
      }),
      prisma.lesson.create({
        data: {
          title: 'Bài 2: Bảng cửu chương 3',
          description: 'Học thuộc bảng cửu chương 3',
          order: 2,
          courseId: grade3MathCourse.id,
        },
      }),
    ]);
    lessons.push(...mathLessons3);
  }

  // Animal World Lessons for Grade 1
  const animalWorldCourse = courses.find(c => c.title === 'Thế giới động vật lớp 1');
  if (animalWorldCourse) {
    const animalLessons = await Promise.all([
      prisma.lesson.create({
        data: {
          title: 'Bài 1: Những con vật gần gũi',
          description: 'Làm quen với các con vật thường gặp xung quanh chúng ta như chó, mèo, gà, vịt',
          order: 1,
          courseId: animalWorldCourse.id,
        },
      }),
      prisma.lesson.create({
        data: {
          title: 'Bài 2: Động vật trong rừng',
          description: 'Khám phá những con vật sống trong rừng như thỏ, sóc, hổ, voi',
          order: 2,
          courseId: animalWorldCourse.id,
        },
      }),
      prisma.lesson.create({
        data: {
          title: 'Bài 3: Động vật dưới nước',
          description: 'Tìm hiểu về cá, ếch, cua và các con vật sống dưới nước',
          order: 3,
          courseId: animalWorldCourse.id,
        },
      }),
      prisma.lesson.create({
        data: {
          title: 'Bài 4: Chim và côn trùng',
          description: 'Học về các loài chim và côn trùng như bướm, ong, kiến',
          order: 4,
          courseId: animalWorldCourse.id,
        },
      }),
    ]);
    lessons.push(...animalLessons);
  }

  // Create LessonSteps for each lesson
  console.log('📝 Creating lesson steps...');
  const lessonSteps = [];
  
  for (const lesson of lessons) {
    // Introduction step (TEXT)
    const introStep = await prisma.lessonStep.create({
      data: {
        title: 'Giới thiệu bài học',
        order: 1,
        contentType: LessonStepType.TEXT,
        contentJson: {
          markdown: `# ${lesson.title}\n\n${lesson.description}\n\nTrong bài học này, các em sẽ học được những kiến thức quan trọng và thú vị. Hãy cùng bắt đầu nhé!`
        },
        lessonId: lesson.id,
      },
    });
    lessonSteps.push(introStep);

    // Video step (if applicable)
    if (lesson.title.includes('Bài 1')) {
      const videoStep = await prisma.lessonStep.create({
        data: {
          title: 'Video bài giảng',
          order: 2,
          contentType: LessonStepType.VIDEO,
          contentJson: {
            videoUrl: 'https://www.youtube.com/watch?v=example',
            duration: 300,
            transcript: 'Transcript của video bài giảng...'
          },
          lessonId: lesson.id,
        },
      });
      lessonSteps.push(videoStep);
    }

    // H5P Interactive step
    let relevantH5P;
    
    // Special handling for Animal World lessons
    if (lesson.title.includes('Những con vật gần gũi')) {
      // For the first animal lesson, use the specific H5P content with the requested ID
      relevantH5P = h5pContents.find(content => content.id === 'cmgkjlcje0005vr49takdw0hc');
    } else {
      // For other lessons, find H5P by subject
      relevantH5P = h5pContents.find(content => 
        content.metadata && 
        JSON.parse(JSON.stringify(content.metadata)).subject === 
        (lesson.title.includes('Toán') ? 'Toán' : 
         lesson.title.includes('Thế giới động vật') || lesson.title.includes('con vật') ? 'Thế giới động vật' :
         'Tiếng Việt')
      );
    }
    
    if (relevantH5P) {
      const h5pStep = await prisma.lessonStep.create({
        data: {
          title: 'Bài tập tương tác',
          order: 3,
          contentType: LessonStepType.H5P,
          lessonId: lesson.id,
          h5pContentId: relevantH5P.id,
        },
      });
      lessonSteps.push(h5pStep);
    }

    // Summary step (TEXT)
    const summaryStep = await prisma.lessonStep.create({
      data: {
        title: 'Tóm tắt bài học',
        order: 4,
        contentType: LessonStepType.TEXT,
        contentJson: {
          markdown: '## Tóm tắt\n\nCác em đã hoàn thành bài học. Hãy ôn tập những kiến thức đã học và chuẩn bị cho bài học tiếp theo!'
        },
        lessonId: lesson.id,
      },
    });
    lessonSteps.push(summaryStep);
  }

  // Create Student Progress
  console.log('📊 Creating student progress...');
  const studentProgress = [];
  
  for (let i = 0; i < allStudents.length; i++) {
    const student = allStudents[i];
    const gradeIndex = Math.floor(i / 5);
    
    // Get lesson steps for the student's grade
    const studentLessonSteps = lessonSteps.filter(step => {
      // Find the lesson this step belongs to
      const stepLesson = lessons.find(l => l.id === step.lessonId);
      if (!stepLesson) return false;
      
      // Find the course this lesson belongs to
      const stepCourse = courses.find(c => c.id === stepLesson.courseId);
      if (!stepCourse) return false;
      
      // Check if this course belongs to the student's grade
      const courseClass = classes.find(cl => cl.id === stepCourse.classId);
      return courseClass && courseClass.gradeLevel === gradeIndex + 1;
    });

    // Create progress for some lesson steps (simulate partial completion)
    for (let j = 0; j < Math.min(studentLessonSteps.length, 3); j++) {
      const step = studentLessonSteps[j];
      const status = j === 0 ? ProgressStatus.COMPLETED : 
                    j === 1 ? ProgressStatus.IN_PROGRESS : 
                    ProgressStatus.NOT_STARTED;
      
      const progress = await prisma.studentProgress.create({
        data: {
          userId: student.id,
          lessonStepId: step.id,
          status: status,
          completedAt: status === ProgressStatus.COMPLETED ? new Date() : null,
        },
      });
      studentProgress.push(progress);

      // Create quiz attempts for completed H5P steps
      if (status === ProgressStatus.COMPLETED && step.contentType === LessonStepType.H5P) {
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
  console.log(`📖 Courses: ${courses.length} (Math, Vietnamese, Science, English by grade)`);
  console.log(`📚 Lessons: ${lessons.length}`);
  console.log(`📝 Lesson Steps: ${lessonSteps.length}`);
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
  
  console.log('\n🎯 Educational Structure:');
  console.log('📚 Each grade has Math and Vietnamese courses');
  console.log('� Grade 1 also has Animal World course with 4 lessons');
  console.log('�🔬 Grades 3-5 also have Science and English courses');
  console.log('📖 Each course contains multiple structured lessons');
  console.log('📝 Each lesson has 4 steps: Introduction → Video → H5P Interactive → Summary');
  console.log('🎮 H5P content provides interactive learning experiences');
  console.log('📊 Student progress is tracked at the lesson step level');
  console.log('🏆 Quiz attempts and xAPI events capture detailed learning analytics');
  console.log('\n🐾 Animal World Course (Grade 1):');
  console.log('   Bài 1: Những con vật gần gũi (with H5P ID: cmgkjlcje0005vr49takdw0hc)');
  console.log('   Bài 2: Động vật trong rừng');
  console.log('   Bài 3: Động vật dưới nước');
  console.log('   Bài 4: Chim và côn trùng');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
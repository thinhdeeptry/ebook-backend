# Quiz & xAPI Tracking System Documentation

## Tổng quan

Hệ thống tracking bài tập/quiz đã được nâng cấp để tuân thủ chuẩn **xAPI (Experience API)** - một tiêu chuẩn quốc tế cho việc theo dõi và ghi nhận trải nghiệm học tập.

## Kiến trúc hệ thống

### 1. Quiz Configuration (`QuizConfig`)

Bảng cấu hình cho mỗi bài tập/quiz, liên kết 1-1 với `PageBlock` có `type = INTERACTIVE`.

**Các trường quan trọng:**
- `passingScore`: Điểm đạt yêu cầu (%), mặc định 70%
- `weight`: Trọng số của bài tập (dùng để tính điểm tổng kết), mặc định 1.0
- `maxAttempts`: Số lần làm tối đa (null = không giới hạn)
- `timeLimit`: Giới hạn thời gian làm bài (phút)
- `shuffleQuestions`: Có xáo trộn câu hỏi không
- `showFeedback`: Hiển thị phản hồi sau khi làm
- `showCorrectAnswers`: Hiển thị đáp án đúng
- `allowReview`: Cho phép xem lại bài đã làm

**Ví dụ sử dụng:**
```typescript
const quizConfig = await prisma.quizConfig.create({
  data: {
    pageBlockId: "block_123",
    title: "Bài tập chương 1",
    passingScore: 80,
    weight: 2.0, // Bài này quan trọng gấp đôi
    maxAttempts: 3,
    timeLimit: 30, // 30 phút
    shuffleQuestions: true,
    showFeedback: true,
    showCorrectAnswers: false // Không hiện đáp án đúng ngay
  }
});
```

### 2. Quiz Questions (`QuizQuestion`)

Quản lý các câu hỏi trong quiz.

**Các trường quan trọng:**
- `questionType`: Loại câu hỏi (multiple-choice, true-false, fill-blank, etc.)
- `points`: Điểm của câu hỏi
- `h5pContentId`: Link đến H5P content nếu câu hỏi sử dụng H5P
- `metadata`: JSON lưu thêm thông tin (đáp án, options, etc.)

**Ví dụ:**
```typescript
const question = await prisma.quizQuestion.create({
  data: {
    quizConfigId: "quiz_123",
    questionText: "Thủ đô của Việt Nam là gì?",
    questionType: "multiple-choice",
    order: 1,
    points: 2.0,
    metadata: {
      options: [
        { id: "a", text: "Hà Nội", isCorrect: true },
        { id: "b", text: "TP.HCM", isCorrect: false },
        { id: "c", text: "Đà Nẵng", isCorrect: false }
      ]
    }
  }
});
```

### 3. Quiz Attempts (`QuizAttempt`)

Ghi nhận mỗi lần học sinh làm bài.

**Các trường mới:**
- `maxScore`: Tổng điểm tối đa của bài
- `duration`: Thời gian làm bài (giây)
- `xapiStatements`: Danh sách xAPI statements liên quan
- `questionResponses`: Câu trả lời chi tiết cho từng câu hỏi

### 4. Question Responses (`QuestionResponse`)

Lưu câu trả lời chi tiết cho từng câu hỏi trong mỗi lần làm bài.

**Ví dụ:**
```typescript
const response = await prisma.questionResponse.create({
  data: {
    quizAttemptId: "attempt_123",
    questionId: "question_456",
    userAnswer: { selectedOption: "a" },
    isCorrect: true,
    pointsEarned: 2.0,
    timeSpent: 45 // 45 giây
  }
});
```

## xAPI Tracking System

### 5. xAPI Statements (`XApiStatement`)

Bảng chính lưu trữ các xAPI statements theo chuẩn quốc tế.

**Cấu trúc xAPI Statement:**
```
Actor (Who) + Verb (Did) + Object (What) + Result + Context
```

**Các trường quan trọng:**
- `statementId`: UUID duy nhất theo chuẩn xAPI
- `actorId`: User thực hiện hành động
- `verbId`: Hành động (completed, attempted, answered, etc.)
- `objectId`: ID của đối tượng (quiz, question, content)
- `objectType`: Loại đối tượng (Activity, Agent, etc.)
- `resultScore`, `resultScoreMin`, `resultScoreMax`: Điểm số
- `resultSuccess`: Có đạt yêu cầu không
- `resultCompletion`: Có hoàn thành không
- `resultDuration`: Thời gian (ISO 8601 format, e.g., "PT30M" = 30 phút)
- `contextJson`: Context bổ sung (lớp học, giáo viên, etc.)
- `version`: Phiên bản xAPI (mặc định "1.0.3")

**Ví dụ tạo xAPI Statement:**
```typescript
const statement = await prisma.xApiStatement.create({
  data: {
    statementId: crypto.randomUUID(),
    actorId: "user_123",
    verbId: "verb_completed",
    objectId: "quiz_456",
    objectType: "Activity",
    resultScore: 85,
    resultScoreMin: 0,
    resultScoreMax: 100,
    resultSuccess: true,
    resultCompletion: true,
    resultDuration: "PT15M30S", // 15 phút 30 giây
    contextJson: {
      contextActivities: {
        parent: [{ id: "lesson_789", objectType: "Activity" }],
        grouping: [{ id: "class_101", objectType: "Activity" }]
      },
      instructor: { id: "teacher_202", objectType: "Agent" }
    },
    quizAttemptId: "attempt_123",
    h5pContentId: "h5p_456"
  }
});
```

### 6. xAPI Verbs (`XApiVerb`)

Bảng định nghĩa các động từ (verbs) theo chuẩn xAPI.

**Các verbs phổ biến:**
- `http://adlnet.gov/expapi/verbs/attempted` - Bắt đầu làm bài
- `http://adlnet.gov/expapi/verbs/completed` - Hoàn thành bài
- `http://adlnet.gov/expapi/verbs/answered` - Trả lời câu hỏi
- `http://adlnet.gov/expapi/verbs/passed` - Đạt yêu cầu
- `http://adlnet.gov/expapi/verbs/failed` - Không đạt
- `http://adlnet.gov/expapi/verbs/scored` - Ghi điểm

**Ví dụ seed verbs:**
```typescript
const verbs = await prisma.xApiVerb.createMany({
  data: [
    {
      verbIri: "http://adlnet.gov/expapi/verbs/completed",
      display: { "en-US": "completed", "vi-VN": "hoàn thành" }
    },
    {
      verbIri: "http://adlnet.gov/expapi/verbs/attempted",
      display: { "en-US": "attempted", "vi-VN": "bắt đầu" }
    },
    {
      verbIri: "http://adlnet.gov/expapi/verbs/answered",
      display: { "en-US": "answered", "vi-VN": "trả lời" }
    }
  ]
});
```

## Quiz Analytics

### 7. Quiz Analytics (`QuizAnalytics`)

Bảng tổng hợp thống kê về kết quả làm bài.

**Tính năng:**
- Thống kê theo từng bài tập (`pageBlockId`)
- Thống kê theo từng học sinh (`userId`) hoặc toàn bộ lớp (`userId = null`)
- Các chỉ số: điểm trung bình, cao nhất, thấp nhất, tỷ lệ đạt, thời gian trung bình

**Ví dụ tính toán analytics:**
```typescript
async function calculateQuizAnalytics(pageBlockId: string, userId?: string) {
  const attempts = await prisma.quizAttempt.findMany({
    where: {
      studentProgress: {
        pageBlockId,
        ...(userId && { userId })
      }
    }
  });

  const scores = attempts.map(a => a.score).filter(s => s !== null);
  
  await prisma.quizAnalytics.upsert({
    where: {
      pageBlockId_userId: { pageBlockId, userId: userId || null }
    },
    create: {
      pageBlockId,
      userId: userId || null,
      totalAttempts: attempts.length,
      averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      passRate: (attempts.filter(a => a.isPass).length / attempts.length) * 100,
      averageTimeSpent: attempts.reduce((sum, a) => sum + (a.duration || 0), 0) / attempts.length
    },
    update: {
      totalAttempts: attempts.length,
      averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      passRate: (attempts.filter(a => a.isPass).length / attempts.length) * 100,
      averageTimeSpent: attempts.reduce((sum, a) => sum + (a.duration || 0), 0) / attempts.length,
      lastCalculated: new Date()
    }
  });
}
```

## Workflow hoàn chỉnh

### Khi học sinh bắt đầu làm bài:

```typescript
// 1. Tạo quiz attempt
const attempt = await prisma.quizAttempt.create({
  data: {
    studentProgressId: progress.id,
    attemptNumber: previousAttempts.length + 1,
    isPass: false
  }
});

// 2. Ghi xAPI statement "attempted"
const attemptedVerb = await prisma.xApiVerb.findUnique({
  where: { verbIri: "http://adlnet.gov/expapi/verbs/attempted" }
});

await prisma.xApiStatement.create({
  data: {
    statementId: crypto.randomUUID(),
    actorId: userId,
    verbId: attemptedVerb.id,
    objectId: quizConfig.id,
    objectType: "Activity",
    quizAttemptId: attempt.id,
    timestamp: new Date()
  }
});
```

### Khi học sinh trả lời từng câu hỏi:

```typescript
// 1. Lưu câu trả lời
const response = await prisma.questionResponse.create({
  data: {
    quizAttemptId: attempt.id,
    questionId: question.id,
    userAnswer: { selectedOption: "a" },
    isCorrect: checkAnswer(userAnswer, question.metadata),
    pointsEarned: isCorrect ? question.points : 0,
    timeSpent: 30
  }
});

// 2. Ghi xAPI statement "answered"
const answeredVerb = await prisma.xApiVerb.findUnique({
  where: { verbIri: "http://adlnet.gov/expapi/verbs/answered" }
});

await prisma.xApiStatement.create({
  data: {
    statementId: crypto.randomUUID(),
    actorId: userId,
    verbId: answeredVerb.id,
    objectId: question.id,
    objectType: "Activity",
    resultScore: response.pointsEarned,
    resultScoreMax: question.points,
    resultSuccess: response.isCorrect,
    resultResponse: response.userAnswer,
    quizAttemptId: attempt.id
  }
});
```

### Khi học sinh hoàn thành bài:

```typescript
// 1. Tính điểm tổng
const totalScore = responses.reduce((sum, r) => sum + r.pointsEarned, 0);
const maxScore = questions.reduce((sum, q) => sum + q.points, 0);
const percentage = (totalScore / maxScore) * 100;
const isPass = percentage >= quizConfig.passingScore;

// 2. Cập nhật quiz attempt
await prisma.quizAttempt.update({
  where: { id: attempt.id },
  data: {
    score: percentage,
    maxScore: 100,
    isPass,
    duration: endTime - startTime
  }
});

// 3. Ghi xAPI statement "completed"
const completedVerb = await prisma.xApiVerb.findUnique({
  where: { verbIri: "http://adlnet.gov/expapi/verbs/completed" }
});

await prisma.xApiStatement.create({
  data: {
    statementId: crypto.randomUUID(),
    actorId: userId,
    verbId: completedVerb.id,
    objectId: quizConfig.id,
    objectType: "Activity",
    resultScore: percentage,
    resultScoreMin: 0,
    resultScoreMax: 100,
    resultSuccess: isPass,
    resultCompletion: true,
    resultDuration: formatDuration(endTime - startTime),
    quizAttemptId: attempt.id
  }
});

// 4. Cập nhật student progress
await prisma.studentProgress.update({
  where: { id: progress.id },
  data: {
    status: isPass ? "COMPLETED" : "IN_PROGRESS",
    completedAt: isPass ? new Date() : null
  }
});

// 5. Tính toán analytics
await calculateQuizAnalytics(pageBlockId, userId);
```

## Migration

Để áp dụng schema mới, chạy:

```bash
npx prisma migrate dev --name add_quiz_xapi_tracking
npx prisma generate
```

## Seed xAPI Verbs

Tạo file `prisma/seeds/xapi-verbs.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedXApiVerbs() {
  const verbs = [
    {
      verbIri: "http://adlnet.gov/expapi/verbs/attempted",
      display: { "en-US": "attempted", "vi-VN": "bắt đầu làm" }
    },
    {
      verbIri: "http://adlnet.gov/expapi/verbs/completed",
      display: { "en-US": "completed", "vi-VN": "hoàn thành" }
    },
    {
      verbIri: "http://adlnet.gov/expapi/verbs/answered",
      display: { "en-US": "answered", "vi-VN": "trả lời" }
    },
    {
      verbIri: "http://adlnet.gov/expapi/verbs/passed",
      display: { "en-US": "passed", "vi-VN": "đạt yêu cầu" }
    },
    {
      verbIri: "http://adlnet.gov/expapi/verbs/failed",
      display: { "en-US": "failed", "vi-VN": "không đạt" }
    },
    {
      verbIri: "http://adlnet.gov/expapi/verbs/scored",
      display: { "en-US": "scored", "vi-VN": "ghi điểm" }
    }
  ];

  for (const verb of verbs) {
    await prisma.xApiVerb.upsert({
      where: { verbIri: verb.verbIri },
      create: verb,
      update: verb
    });
  }

  console.log('✅ Seeded xAPI verbs');
}
```

## Lợi ích của hệ thống mới

1. **Tuân thủ chuẩn quốc tế**: xAPI là chuẩn được công nhận rộng rãi
2. **Tracking chi tiết**: Theo dõi từng hành động của học sinh
3. **Phân tích sâu**: Dữ liệu phong phú cho báo cáo và analytics
4. **Tương thích**: Có thể tích hợp với các LRS (Learning Record Store) khác
5. **Linh hoạt**: Dễ dàng mở rộng thêm các loại tracking mới
6. **Quản lý bài tập tốt hơn**: Cấu hình trọng số, giới hạn lần làm, thời gian, etc.

## Tài liệu tham khảo

- [xAPI Specification](https://github.com/adlnet/xAPI-Spec)
- [xAPI Verbs Registry](https://registry.tincanapi.com/)
- [Learning Locker (LRS)](https://www.ht2labs.com/learning-locker-community/overview/)

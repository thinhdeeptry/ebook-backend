# Kiến trúc Quiz & xAPI - Giải thích Chi tiết

## 1. XApiVerb - Trái tim của xAPI

### XApiVerb là gì?

`XApiVerb` lưu trữ các **động từ (verbs)** theo chuẩn xAPI. Mọi hành động trong xAPI đều theo công thức:

```
Actor (Ai) + Verb (Làm gì) + Object (Với cái gì) = Statement
```

### Cấu trúc

```prisma
model XApiVerb {
  id          String   @id @default(cuid())
  verbIri     String   @unique // URL định danh verb
  display     Json     // Tên hiển thị đa ngôn ngữ
  statements  XApiStatement[]
}
```

### Các trường quan trọng

#### 1. verbIri (IRI = Internationalized Resource Identifier)
- **Là gì**: URL duy nhất định danh động từ theo chuẩn xAPI
- **Format**: `http://adlnet.gov/expapi/verbs/{verb_name}`
- **Ví dụ**: `http://adlnet.gov/expapi/verbs/completed`

**Tại sao dùng URL?**
- ✅ Đảm bảo tính duy nhất toàn cầu
- ✅ Tránh xung đột giữa các hệ thống
- ✅ Có thể dereference để lấy thông tin chi tiết

#### 2. display (JSON)
```json
{
  "en-US": "completed",
  "vi-VN": "hoàn thành",
  "fr-FR": "terminé"
}
```

**Lợi ích:**
- ✅ Hỗ trợ đa ngôn ngữ linh hoạt
- ✅ Dễ thêm ngôn ngữ mới
- ✅ Tuân thủ chuẩn xAPI

### 6 Verbs chuẩn

#### 1. attempted - Bắt đầu làm
```json
{
  "verbIri": "http://adlnet.gov/expapi/verbs/attempted",
  "display": { "vi-VN": "bắt đầu làm" }
}
```
**Khi nào**: Click "Bắt đầu làm bài"

#### 2. answered - Trả lời
```json
{
  "verbIri": "http://adlnet.gov/expapi/verbs/answered",
  "display": { "vi-VN": "trả lời" }
}
```
**Khi nào**: Submit câu trả lời

#### 3. completed - Hoàn thành
```json
{
  "verbIri": "http://adlnet.gov/expapi/verbs/completed",
  "display": { "vi-VN": "hoàn thành" }
}
```
**Khi nào**: Submit toàn bộ bài

#### 4. passed - Đạt yêu cầu
```json
{
  "verbIri": "http://adlnet.gov/expapi/verbs/passed",
  "display": { "vi-VN": "đạt yêu cầu" }
}
```
**Khi nào**: Điểm >= passingScore

#### 5. failed - Không đạt
```json
{
  "verbIri": "http://adlnet.gov/expapi/verbs/failed",
  "display": { "vi-VN": "không đạt" }
}
```
**Khi nào**: Điểm < passingScore

#### 6. scored - Ghi điểm
```json
{
  "verbIri": "http://adlnet.gov/expapi/verbs/scored",
  "display": { "vi-VN": "ghi điểm" }
}
```
**Khi nào**: Hệ thống tính điểm

### Tại sao tách riêng XApiVerb?

#### 1. Normalization
```
❌ Lưu trực tiếp: Lặp lại display cho mỗi statement
✅ Tách riêng: Chỉ lưu verbId, tiết kiệm storage
```

#### 2. Query Performance
```sql
-- Nhanh: Index trên verbId
SELECT * FROM xapi_statements WHERE verbId = 'verb_123'

-- Chậm: Search trong JSON
SELECT * FROM xapi_statements WHERE verb->>'iri' = 'http://...'
```

#### 3. Validation
```typescript
// Đảm bảo chỉ dùng verbs hợp lệ
const verb = await prisma.xApiVerb.findUnique({
  where: { verbIri: 'http://adlnet.gov/expapi/verbs/completed' }
});

if (!verb) throw new Error('Invalid verb');
```

#### 4. Extensibility
```typescript
// Dễ dàng thêm verb mới
await prisma.xApiVerb.create({
  data: {
    verbIri: 'http://adlnet.gov/expapi/verbs/reviewed',
    display: { 'vi-VN': 'xem lại' }
  }
});
```

## 2. Luồng hoạt động Quiz

### Bước 1: Setup Quiz

```typescript
// 1. Tạo QuizConfig
const quizConfig = await prisma.quizConfig.create({
  data: {
    pageBlockId: pageBlock.id,
    passingScore: 70,    // 70% để đạt
    weight: 2.0,         // Trọng số gấp đôi
    maxAttempts: 3,      // Tối đa 3 lần
    timeLimit: 15        // 15 phút
  }
});

// 2. Tạo Questions
await prisma.quizQuestion.createMany({
  data: [
    {
      quizConfigId: quizConfig.id,
      questionText: '2 + 2 = ?',
      points: 2.0,
      metadata: {
        options: [
          { id: 'a', text: '4', isCorrect: true }
        ]
      }
    }
  ]
});
```

### Bước 2: Bắt đầu làm bài

```typescript
// 1. Tạo QuizAttempt
const attempt = await prisma.quizAttempt.create({
  data: {
    studentProgressId: progress.id,
    attemptNumber: 1,
    isPass: false
  }
});

// 2. Ghi xAPI "attempted"
const verb = await prisma.xApiVerb.findUnique({
  where: { verbIri: 'http://adlnet.gov/expapi/verbs/attempted' }
});

await prisma.xApiStatement.create({
  data: {
    statementId: crypto.randomUUID(),
    actorId: student.id,
    verbId: verb.id,
    objectId: quizConfig.id,
    objectType: 'Activity',
    quizAttemptId: attempt.id
  }
});
```

### Bước 3: Trả lời câu hỏi

```typescript
// 1. Lưu QuestionResponse
const response = await prisma.questionResponse.create({
  data: {
    quizAttemptId: attempt.id,
    questionId: question.id,
    userAnswer: { selectedOption: 'a' },
    isCorrect: true,
    pointsEarned: 2.0,
    timeSpent: 45
  }
});

// 2. Ghi xAPI "answered"
const verb = await prisma.xApiVerb.findUnique({
  where: { verbIri: 'http://adlnet.gov/expapi/verbs/answered' }
});

await prisma.xApiStatement.create({
  data: {
    statementId: crypto.randomUUID(),
    actorId: student.id,
    verbId: verb.id,
    objectId: question.id,
    resultScore: 2.0,
    resultSuccess: true,
    resultResponse: { selectedOption: 'a' }
  }
});
```

### Bước 4: Hoàn thành bài

```typescript
// 1. Tính điểm
const percentage = (totalPoints / maxPoints) * 100;
const isPass = percentage >= quizConfig.passingScore;

// 2. Cập nhật QuizAttempt
await prisma.quizAttempt.update({
  where: { id: attempt.id },
  data: {
    score: percentage,
    maxScore: 100,
    isPass: isPass,
    duration: 900 // 15 phút = 900 giây
  }
});

// 3. Ghi xAPI "completed"
await prisma.xApiStatement.create({
  data: {
    statementId: crypto.randomUUID(),
    actorId: student.id,
    verbId: completedVerb.id,
    objectId: quizConfig.id,
    resultScore: percentage,
    resultScoreMax: 100,
    resultSuccess: isPass,
    resultCompletion: true,
    resultDuration: 'PT15M' // ISO 8601
  }
});

// 4. Ghi xAPI "passed" hoặc "failed"
await prisma.xApiStatement.create({
  data: {
    statementId: crypto.randomUUID(),
    actorId: student.id,
    verbId: isPass ? passedVerb.id : failedVerb.id,
    objectId: quizConfig.id,
    resultScore: percentage,
    resultSuccess: isPass
  }
});
```

## 3. XApiStatement - Ghi nhận chi tiết

### Cấu trúc

```prisma
model XApiStatement {
  // Core
  statementId     String   @unique // UUID chuẩn xAPI
  actorId         String   // Ai
  verbId          String   // Làm gì
  objectId        String   // Với cái gì
  
  // Result
  resultScore     Float?
  resultScoreMax  Float?
  resultSuccess   Boolean?
  resultDuration  String?  // ISO 8601: PT15M30S
  resultResponse  Json?
  
  // Context
  contextJson     Json?
  
  // Relations
  actor           User @relation("XApiActor")
  verb            XApiVerb @relation()
  quizAttempt     QuizAttempt?
}
```

### ISO 8601 Duration

```typescript
// Format
"PT15M30S"  // 15 phút 30 giây
"PT1H"      // 1 giờ
"PT45S"     // 45 giây

// Chuyển đổi
function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  
  let duration = 'PT';
  if (h > 0) duration += `${h}H`;
  if (m > 0) duration += `${m}M`;
  if (s > 0) duration += `${s}S`;
  return duration;
}
```

### Context JSON

```json
{
  "platform": "Hệ thống học tập tiểu học",
  "language": "vi-VN",
  "contextActivities": {
    "parent": [
      { "id": "lesson_123", "objectType": "Activity" }
    ],
    "grouping": [
      { "id": "class_1a", "objectType": "Activity" }
    ]
  },
  "instructor": {
    "id": "teacher_456",
    "name": "Cô Linh"
  }
}
```

## 4. Mối quan hệ giữa các bảng

```
User (Học sinh)
  └─> StudentProgress
       └─> QuizAttempt
            ├─> QuestionResponse (nhiều)
            └─> XApiStatement (nhiều)
                 └─> XApiVerb

PageBlock (H5P)
  └─> QuizConfig
       └─> QuizQuestion (nhiều)
            └─> QuestionResponse (nhiều)
```

## 5. Use Cases

### Query 1: Lịch sử làm bài của học sinh

```typescript
const history = await prisma.quizAttempt.findMany({
  where: {
    studentProgress: {
      userId: student.id,
      pageBlock: {
        quizConfig: {
          id: quizConfig.id
        }
      }
    }
  },
  include: {
    questionResponses: true,
    xapiStatements: {
      include: { verb: true }
    }
  },
  orderBy: { submittedAt: 'desc' }
});
```

### Query 2: Phân tích câu hỏi khó

```typescript
const difficultQuestions = await prisma.quizQuestion.findMany({
  where: {
    quizConfigId: quizConfig.id
  },
  include: {
    responses: true
  }
}).then(questions => 
  questions.map(q => ({
    question: q.questionText,
    correctRate: q.responses.filter(r => r.isCorrect).length / q.responses.length
  }))
  .filter(q => q.correctRate < 0.5)
  .sort((a, b) => a.correctRate - b.correctRate)
);
```

### Query 3: Timeline hoạt động

```typescript
const timeline = await prisma.xApiStatement.findMany({
  where: {
    actorId: student.id,
    quizAttemptId: attempt.id
  },
  include: {
    verb: true
  },
  orderBy: { timestamp: 'asc' }
});

// Kết quả:
// 10:00 - attempted (bắt đầu)
// 10:02 - answered (câu 1)
// 10:05 - answered (câu 2)
// 10:15 - completed (hoàn thành)
// 10:15 - passed (đạt)
```

## 6. Best Practices

### 1. Luôn tạo xAPI statements
```typescript
// ✅ Tốt: Ghi nhận mọi hành động
await createStatement('attempted');
await createStatement('answered');
await createStatement('completed');

// ❌ Tránh: Bỏ qua tracking
// Không ghi nhận gì
```

### 2. Sử dụng transactions
```typescript
await prisma.$transaction(async (tx) => {
  const attempt = await tx.quizAttempt.create({...});
  await tx.xApiStatement.create({...});
});
```

### 3. Index cho performance
```prisma
@@index([actorId, timestamp])
@@index([verbId])
@@index([objectId])
```

### 4. Validate verb trước khi dùng
```typescript
const verb = await getVerb('completed');
if (!verb) throw new Error('Invalid verb');
```

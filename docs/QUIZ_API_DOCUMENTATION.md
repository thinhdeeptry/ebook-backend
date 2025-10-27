# Quiz API Documentation

## Tổng quan

API Quiz cung cấp đầy đủ chức năng để quản lý bài tập, theo dõi tiến độ học sinh và phân tích kết quả.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Tất cả endpoints đều yêu cầu Bearer Token trong header:

```
Authorization: Bearer <access_token>
```

---

## 1. Quiz Configuration APIs

### 1.1. Tạo Quiz Config

**POST** `/quiz/config`

Tạo cấu hình quiz mới cho một PageBlock.

**Request Body:**
```json
{
  "pageBlockId": "clxxx123",
  "title": "Bài tập Toán Chương 1",
  "description": "Kiểm tra kiến thức về phép cộng và trừ",
  "passingScore": 70,
  "weight": 2.0,
  "maxAttempts": 3,
  "timeLimit": 15,
  "shuffleQuestions": true,
  "showFeedback": true,
  "showCorrectAnswers": true,
  "allowReview": true
}
```

**Response:** `201 Created`
```json
{
  "id": "quiz_config_123",
  "pageBlockId": "clxxx123",
  "title": "Bài tập Toán Chương 1",
  "passingScore": 70,
  "weight": 2.0,
  "maxAttempts": 3,
  "timeLimit": 15,
  "createdAt": "2025-10-27T07:00:00Z",
  "updatedAt": "2025-10-27T07:00:00Z"
}
```

### 1.2. Lấy Quiz Config theo PageBlock

**GET** `/quiz/config/page-block/:pageBlockId`

**Response:** `200 OK`
```json
{
  "id": "quiz_config_123",
  "pageBlockId": "clxxx123",
  "title": "Bài tập Toán Chương 1",
  "passingScore": 70,
  "questions": [
    {
      "id": "question_1",
      "questionText": "2 + 2 = ?",
      "questionType": "multiple-choice",
      "order": 1,
      "points": 2.0
    }
  ]
}
```

### 1.3. Cập nhật Quiz Config

**PUT** `/quiz/config/:id`

**Request Body:**
```json
{
  "passingScore": 75,
  "maxAttempts": 5
}
```

### 1.4. Xóa Quiz Config

**DELETE** `/quiz/config/:id`

**Response:** `200 OK`

---

## 2. Quiz Question APIs

### 2.1. Tạo Câu hỏi

**POST** `/quiz/question`

**Request Body:**
```json
{
  "quizConfigId": "quiz_config_123",
  "questionText": "2 + 2 = ?",
  "questionType": "multiple-choice",
  "order": 1,
  "points": 2.0,
  "metadata": {
    "options": [
      { "id": "a", "text": "3", "isCorrect": false },
      { "id": "b", "text": "4", "isCorrect": true },
      { "id": "c", "text": "5", "isCorrect": false }
    ],
    "feedback": {
      "correct": "Chính xác! 2 + 2 = 4",
      "incorrect": "Hãy thử lại nhé!"
    }
  }
}
```

**Response:** `201 Created`

### 2.2. Lấy danh sách câu hỏi

**GET** `/quiz/question/quiz-config/:quizConfigId`

**Response:** `200 OK`
```json
[
  {
    "id": "question_1",
    "questionText": "2 + 2 = ?",
    "questionType": "multiple-choice",
    "order": 1,
    "points": 2.0,
    "metadata": { ... }
  }
]
```

### 2.3. Cập nhật câu hỏi

**PUT** `/quiz/question/:id`

### 2.4. Xóa câu hỏi

**DELETE** `/quiz/question/:id`

---

## 3. Quiz Attempt APIs (Student)

### 3.1. Bắt đầu làm bài

**POST** `/quiz/attempt/start`

**Request Body:**
```json
{
  "pageBlockId": "clxxx123"
}
```

**Response:** `201 Created`
```json
{
  "attemptId": "attempt_456",
  "attemptNumber": 1,
  "questions": [
    {
      "id": "question_1",
      "questionText": "2 + 2 = ?",
      "questionType": "multiple-choice",
      "order": 1,
      "points": 2.0,
      "metadata": {
        "options": [
          { "id": "a", "text": "3" },
          { "id": "b", "text": "4" },
          { "id": "c", "text": "5" }
        ]
      }
    }
  ],
  "timeLimit": 15,
  "totalPoints": 10
}
```

**Note:** 
- Câu hỏi sẽ được xáo trộn nếu `shuffleQuestions: true`
- Đáp án đúng đã được loại bỏ khỏi metadata

### 3.2. Submit câu trả lời

**POST** `/quiz/attempt/submit-answer`

**Request Body:**
```json
{
  "attemptId": "attempt_456",
  "questionId": "question_1",
  "userAnswer": {
    "selectedOption": "b"
  },
  "timeSpent": 45
}
```

**Response:** `200 OK`
```json
{
  "responseId": "response_789",
  "isCorrect": true,
  "pointsEarned": 2.0,
  "maxPoints": 2.0
}
```

**Note:** 
- Có thể submit từng câu một hoặc submit tất cả cùng lúc khi complete
- xAPI Statement "answered" được tạo tự động

### 3.3. Hoàn thành bài tập

**POST** `/quiz/attempt/complete`

**Request Body:**
```json
{
  "attemptId": "attempt_456",
  "answers": [
    {
      "questionId": "question_1",
      "userAnswer": { "selectedOption": "b" },
      "timeSpent": 45
    },
    {
      "questionId": "question_2",
      "userAnswer": { "selectedOption": "a" },
      "timeSpent": 60
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "attemptId": "attempt_456",
  "score": 85.5,
  "maxScore": 100,
  "percentage": 85.5,
  "isPass": true,
  "passingScore": 70,
  "duration": 900,
  "totalQuestions": 5,
  "correctAnswers": 4,
  "incorrectAnswers": 1
}
```

**Note:**
- Tự động tính điểm và cập nhật StudentProgress
- Tạo 2 xAPI Statements: "completed" và "passed"/"failed"

---

## 4. Quiz Analytics APIs

### 4.1. Lấy Analytics tổng quan

**GET** `/quiz-analytics/quiz/:pageBlockId?userId=xxx`

**Query Parameters:**
- `userId` (optional): Lọc theo user cụ thể

**Response:** `200 OK`
```json
{
  "id": "analytics_123",
  "pageBlockId": "clxxx123",
  "userId": null,
  "totalAttempts": 25,
  "averageScore": 78.5,
  "highestScore": 95,
  "lowestScore": 45,
  "passRate": 80,
  "averageTimeSpent": 720,
  "lastCalculatedAt": "2025-10-27T08:00:00Z"
}
```

### 4.2. Phân tích từng câu hỏi

**GET** `/quiz-analytics/questions/:quizConfigId`

**Response:** `200 OK`
```json
[
  {
    "questionId": "question_1",
    "questionText": "2 + 2 = ?",
    "totalResponses": 25,
    "correctResponses": 20,
    "incorrectResponses": 5,
    "correctRate": 80,
    "averageTimeSpent": 45,
    "answerDistribution": {
      "a": 3,
      "b": 20,
      "c": 2
    }
  }
]
```

**Use case:** Xác định câu hỏi khó, câu nào học sinh hay nhầm

### 4.3. Performance của từng học sinh

**GET** `/quiz-analytics/students/:quizConfigId`

**Response:** `200 OK`
```json
[
  {
    "studentId": "student_123",
    "studentName": "Nguyễn Văn An",
    "totalAttempts": 2,
    "bestScore": 85,
    "averageScore": 77.5,
    "lastAttemptScore": 85,
    "isPassed": true,
    "totalTimeSpent": 1800,
    "lastAttemptDate": "2025-10-27T07:30:00Z"
  }
]
```

### 4.4. Analytics cho cả lớp

**GET** `/quiz-analytics/class/:quizConfigId/:classId`

**Response:** `200 OK`
```json
{
  "quizId": "quiz_config_123",
  "quizTitle": "Bài tập Toán Chương 1",
  "totalStudents": 25,
  "studentsAttempted": 20,
  "studentsPassed": 16,
  "passRate": 80,
  "averageScore": 78.5,
  "highestScore": 95,
  "lowestScore": 45,
  "studentPerformances": [ ... ],
  "questionAnalytics": [ ... ]
}
```

**Use case:** Dashboard cho giáo viên xem tổng quan lớp học

### 4.5. Tính toán và lưu Analytics

**POST** `/quiz-analytics/calculate/:pageBlockId?userId=xxx`

**Query Parameters:**
- `userId` (optional): Tính cho user cụ thể

**Response:** `200 OK`
```json
{
  "id": "analytics_123",
  "totalAttempts": 25,
  "averageScore": 78.5,
  ...
}
```

**Note:** Tự động chạy sau mỗi lần complete quiz, nhưng có thể trigger thủ công

---

## 5. Luồng hoạt động End-to-End

### Luồng học sinh làm bài

```
1. GET /quiz/config/page-block/:pageBlockId
   → Lấy thông tin quiz (timeLimit, passingScore, etc.)

2. POST /quiz/attempt/start
   → Nhận attemptId và danh sách câu hỏi (đã xáo trộn, không có đáp án)

3. POST /quiz/attempt/submit-answer (nhiều lần)
   → Submit từng câu, nhận feedback ngay (nếu showFeedback: true)

4. POST /quiz/attempt/complete
   → Submit toàn bộ bài, nhận kết quả chi tiết

5. GET /quiz-analytics/quiz/:pageBlockId?userId=xxx
   → Xem analytics cá nhân
```

### Luồng giáo viên tạo quiz

```
1. POST /quiz/config
   → Tạo cấu hình quiz

2. POST /quiz/question (nhiều lần)
   → Thêm câu hỏi vào quiz

3. GET /quiz-analytics/class/:quizConfigId/:classId
   → Xem kết quả của cả lớp

4. GET /quiz-analytics/questions/:quizConfigId
   → Phân tích câu hỏi nào khó, cần giải thích thêm
```

---

## 6. Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Đã hết số lần làm bài (3 lần)",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Không có quyền truy cập",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Quiz không tồn tại",
  "error": "Not Found"
}
```

---

## 7. xAPI Tracking

Các xAPI Statements được tự động tạo:

### 7.1. "attempted" - Khi bắt đầu
```json
{
  "actor": { "id": "student_123" },
  "verb": { "id": "http://adlnet.gov/expapi/verbs/attempted" },
  "object": { "id": "quiz_config_123" },
  "timestamp": "2025-10-27T07:00:00Z"
}
```

### 7.2. "answered" - Khi trả lời câu hỏi
```json
{
  "actor": { "id": "student_123" },
  "verb": { "id": "http://adlnet.gov/expapi/verbs/answered" },
  "object": { "id": "question_1" },
  "result": {
    "score": 2.0,
    "success": true,
    "response": { "selectedOption": "b" }
  }
}
```

### 7.3. "completed" - Khi hoàn thành
```json
{
  "actor": { "id": "student_123" },
  "verb": { "id": "http://adlnet.gov/expapi/verbs/completed" },
  "object": { "id": "quiz_config_123" },
  "result": {
    "score": 85.5,
    "success": true,
    "completion": true,
    "duration": "PT15M"
  }
}
```

### 7.4. "passed" hoặc "failed"
```json
{
  "actor": { "id": "student_123" },
  "verb": { "id": "http://adlnet.gov/expapi/verbs/passed" },
  "object": { "id": "quiz_config_123" },
  "result": {
    "score": 85.5,
    "success": true
  }
}
```

---

## 8. Best Practices

### 8.1. Frontend Implementation

```typescript
// 1. Start quiz
const { attemptId, questions, timeLimit } = await startQuiz(pageBlockId);

// 2. Timer
const timer = setTimeout(() => {
  completeQuiz(attemptId, answers);
}, timeLimit * 60 * 1000);

// 3. Submit answers
for (const answer of answers) {
  await submitAnswer(attemptId, answer);
}

// 4. Complete
const result = await completeQuiz(attemptId, answers);

// 5. Show result
showResult(result);
```

### 8.2. Caching

- Cache quiz config và questions (ít thay đổi)
- Không cache attempts và analytics (thay đổi thường xuyên)

### 8.3. Real-time Updates

- Sử dụng WebSocket để update analytics real-time
- Notify giáo viên khi học sinh hoàn thành bài

---

## 9. Testing với Swagger

Truy cập: `http://localhost:3000/api-docs`

Swagger UI cung cấp:
- Interactive API documentation
- Try it out functionality
- Schema definitions
- Example requests/responses

# 📱 UI Design Brief - E-Learning Platform với NestJS Backend

## 🎯 Tổng quan dự án
Thiết kế giao diện người dùng cho nền tảng e-learning với backend NestJS đầy đủ tính năng, hỗ trợ đọc sách EPUB, nội dung H5P tương tác, và analytics học tập.

**Backend API:** `http://localhost:3001`  
**API Documentation:** `http://localhost:3001/api`  
**Authentication:** JWT Bearer Token  

---

## 🎨 Triết lý thiết kế chung

### 🧘‍♀️ Tối giản và Tập trung (Minimal & Focused)
- **Reading Focus**: Màn hình đọc sách loại bỏ hoàn toàn các yếu tố gây xao nhãng
- **Progressive Disclosure**: Hiển thị thông tin theo từng cấp độ, chỉ show những gì cần thiết
- **Clean Typography**: Sử dụng font chữ dễ đọc, line-height phù hợp cho việc đọc lâu
- **White Space**: Tận dụng không gian trống để tạo sự thoải mái cho mắt

### 🌈 Thân thiện và Truyền cảm hứng (Friendly & Motivating)  
- **Color Psychology**: Màu xanh lá (học tập), cam (động lực), xanh dương (tin cậy)
- **Micro-interactions**: Animations nhỏ khi hoàn thành bài tập, level up
- **Gamification Elements**: Progress rings, streaks, achievement badges
- **Encouraging Feedback**: Positive reinforcement messages
- **Friendly Icons**: Rounded, approachable icon style

### 📊 Lấy dữ liệu làm trung tâm (Data-Driven cho Giáo viên)
- **Dashboard Analytics**: Charts, graphs, heatmaps sử dụng data từ `/tracking/analytics`
- **Real-time Updates**: Live progress tracking từ xAPI events
- **Actionable Insights**: Recommendations dựa trên learning patterns
- **Export Capabilities**: PDF reports, CSV data exports
- **Visual Hierarchy**: Important metrics stand out

### 📱 Responsive Design
- **Mobile-first**: Ưu tiên trải nghiệm mobile cho học sinh
- **Tablet-optimized**: Layout tối ưu cho việc đọc trên tablet
- **Desktop-enhanced**: Tận dụng không gian lớn cho analytics và management
- **Touch-friendly**: Buttons và interactive elements đủ lớn
- **Gesture Support**: Swipe, pinch-to-zoom cho mobile

### 🎭 Nguồn cảm hứng
- **Duolingo**: Gamification, progress tracking, streak systems
- **Notion**: Clean interface, block-based content, smooth interactions  
- **Canvas LMS**: Teacher dashboard, gradebook, course structure
- **Medium**: Reading experience, typography, distraction-free interface
- **Apple Books**: Clean reader interface, easy controls

---

## 👩‍🎓 Giao diện cho Học sinh (Student Interface)

### 🏠 Dashboard - "Thư viện của tôi"
**Endpoint sử dụng:** `GET /epub?public=true`, `GET /tracking/progress/{userId}`

#### 📱 Layout Structure
```
┌─────────────────────────────────────────────┐
│ 📚 My Library | 🔍 Search  [👤 Avatar ▼]   │
├─────────────────────────────────────────────┤
│                                             │
│ 👋 Welcome back, John!                      │
│ Continue where you left off:                │
│ ┌───────────────────────────────────────┐  │
│ │ 📖 English Grammar - Chapter 9        │  │
│ │ ████████████████▓▓▓▓▓▓▓▓ 75%         │  │
│ │ [Continue Reading →]                   │  │
│ └───────────────────────────────────────┘  │
│                                             │
│ 📚 My Books                    [Grid] [List]│
│ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│ │ [Cover] │ │ [Cover] │ │ [Cover] │       │
│ │Grammar  │ │Math 101 │ │Science  │       │
│ │Dr. Smith│ │Prof. Lee│ │Dr. Brown│       │
│ │████ 75% │ │████ 45% │ │██░░ 10% │       │
│ │Continue │ │Continue │ │Start    │       │
│ └─────────┘ └─────────┘ └─────────┘       │
│                                             │
│ 🏆 Your Achievements                        │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐          │
│ │ 🔥  │ │ ⭐  │ │ 📚  │ │ 🎯  │          │
│ │7 day│ │100pt│ │5bks │ │Quiz │          │
│ │strek│ │this │ │read │ │mstr │          │
│ └─────┘ └─────┘ └─────┘ └─────┘          │
└─────────────────────────────────────────────┘
```

#### 📊 Book Card Components
**Data từ API:**
```javascript
// GET /epub - Lấy danh sách sách
{
  id: "clxxxxx",
  title: "English Grammar Fundamentals",
  author: "Dr. Emily Watson", 
  coverImage: "/uploads/covers/english-grammar.jpg",
  fileSize: "5242880",
  isPublic: true,
  uploader: {...}
}

// GET /tracking/progress/{userId}?contentId={bookId}
{
  contentId: "clxxxxx",
  contentTitle: "English Grammar Fundamentals",
  totalInteractions: 145,
  completedSections: 9,
  lastActivity: "2025-10-01T10:30:00Z",
  progress: 75.5
}
```

#### 🎨 Book Card Visual Design
- **Aspect Ratio**: 3:4 cho cover image
- **Shadow**: `box-shadow: 0 4px 12px rgba(0,0,0,0.1)`
- **Hover Effect**: Lift up với `transform: translateY(-4px)`
- **Border Radius**: 12px cho modern look
- **Progress Ring**: Circular với gradient
- **Typography**: 
  - Title: `font-size: 1.125rem; font-weight: 600`
  - Author: `font-size: 0.875rem; color: #6B7280`

#### 🏆 Gamification Features Implementation
**Data từ Tracking Events:**
```javascript
// POST /tracking - Gửi event khi hoàn thành activity
{
  verb: "completed",
  objectId: "chapter-9",
  contentId: "clxxxxx",
  result: {
    completion: true,
    score: { raw: 95, max: 100 },
    duration: "PT15M30S"
  }
}

// Tính toán từ multiple events:
- Reading Streak: Consecutive days có ít nhất 1 "experienced" event
- Points: Sum của scores từ quiz results
- Books Completed: Count của "completed" events với objectId = book
- Achievements: Logic-based badges khi đạt milestones
```

**Achievement Types:**
- 🔥 **Streak**: 3, 7, 14, 30, 100 days
- ⭐ **Points**: 50, 100, 500, 1000 points
- 📚 **Books**: 1, 5, 10, 25, 50 books completed
- 🎯 **Quiz Master**: 10 quizzes với score > 90%
- 🚀 **Speed Reader**: Hoàn thành book trong < 3 days
- 🌟 **Perfect Score**: 5 quizzes với 100% score

---

### 📖 Reader Interface - Immersive Reading Experience
**Endpoints:** 
- `GET /epub/{id}/content` - Lấy nội dung sách và metadata
- `GET /epub/{id}/download` - Download file EPUB
- `GET /h5p/content/{contentId}` - Lấy H5P player data
- `POST /tracking` - Track reading progress

#### 🖼️ Layout Architecture
```
┌─────────────────────────────────────────────────────┐
│ [☰] [Aa] [🔍] [🔖] [⚙️]         [Progress: 34%] │ (Auto-hide)
├──────┬──────────────────────────────────────────────┤
│ TOC  │ MAIN READING AREA                          │
│      │                                            │
│ 1. → │ ═══════════════════════════════════════    │
│ 2.   │                                            │
│ 3.   │ Chapter 3: Present Perfect Tense          │
│ 4.   │                                            │
│ 5.   │ The present perfect tense is used to      │
│      │ describe actions that happened at an       │
│      │ unspecified 🎤 time...                     │
│      │                                            │
│      │ ┌────────────────────────────────────┐    │
│      │ │  H5P QUIZ: Practice Makes Perfect  │    │
│      │ │  Question 1 of 5                   │    │
│      │ │  Which sentence is correct?        │    │
│      │ │  ○ I have went there                │    │
│      │ │  ○ I have gone there                │    │
│      │ │  [Check Answer]                     │    │
│      │ └────────────────────────────────────┘    │
│      │                                            │
│      │ After completing the exercise, we can     │
│      │ move on to more complex structures...     │
│      │                                            │
├──────┴──────────────────────────────────────────────┤
│    [← Previous Chapter]   [Next Chapter →]         │
└─────────────────────────────────────────────────────┘
```

#### ⚙️ Reading Controls & Features

**1. Table of Contents (TOC) Sidebar**
```javascript
// Data từ metadata.tableOfContents
{
  chapters: [
    { id: "ch1", title: "Introduction", page: 1, completed: true },
    { id: "ch2", title: "Grammar Basics", page: 15, completed: true },
    { id: "ch3", title: "Present Perfect", page: 32, completed: false }
  ]
}
```
- **Width**: 280px, collapsible to 0
- **Interaction**: Click chapter -> jump to that section
- **Visual**: Checkmark ✓ cho completed chapters
- **Progress**: Mini progress bar cho mỗi chapter

**2. Typography Controls (Aa Button)**
```
┌──────────────────────────────┐
│ Reading Settings             │
├──────────────────────────────┤
│ Font Family                  │
│ ○ Serif   ● Sans   ○ Mono   │
│                              │
│ Font Size                    │
│ [A-] ━━●━━━━━ [A+]          │
│                              │
│ Line Height                  │
│ [─] ━━━●━━━ [≡]             │
│                              │
│ Theme                        │
│ ☀️ Light  🌙 Dark  🌓 Auto  │
│                              │
│ [Reset to Default]           │
└──────────────────────────────┘
```
- **Persistence**: Save preferences to localStorage
- **Live Preview**: Changes apply immediately

**3. Bookmark Feature**
```javascript
// POST /tracking - Bookmark event
{
  verb: "bookmarked",
  objectId: "chapter-3-section-2",
  contentId: "book-id",
  context: {
    page: 45,
    scrollPosition: 1234,
    excerpt: "The present perfect tense..."
  }
}

// GET /tracking?userId={id}&verb=bookmarked
// Returns all bookmarks for sidebar display
```

**4. Search Functionality**
```javascript
// Frontend: Full-text search trong EPUB content
// Backend: Index content khi upload
// UI: Show results với context highlighting
```

#### 📊 Progress Tracking Implementation
```javascript
// Auto-save progress every 30 seconds
setInterval(() => {
  POST /tracking {
    verb: "experienced",
    objectId: getCurrentChapterId(),
    contentId: bookId,
    result: {
      duration: calculateReadingTime(),
      progress: calculateProgress()
    },
    context: {
      page: currentPage,
      scrollPosition: window.scrollY,
      device: getDeviceInfo()
    }
  }
}, 30000);

// Khi rời khỏi page
window.addEventListener('beforeunload', () => {
  saveProgress();
});
```

#### 🎮 H5P Content Integration
**Seamless Embedding:**
```javascript
// GET /h5p/content/{contentId}
{
  content: {
    library: "H5P.QuestionSet",
    params: {
      questions: [...],
      progressType: "dots",
      passPercentage: 70
    },
    metadata: {
      title: "Grammar Practice Quiz"
    }
  },
  integration: {
    ajax: {
      setFinished: "/h5p/setFinished",
      contentUserData: "/h5p/contentUserData"
    }
  }
}
```

**Styling:**
```css
.h5p-content {
  border: none !important;
  box-shadow: none !important;
  margin: 2rem 0;
  background: transparent;
}

.h5p-iframe {
  border-radius: 12px;
  background: var(--surface-color);
}
```

**Auto-tracking:**
```javascript
// H5P automatically sends xAPI statements
// Backend receives at POST /tracking
// Example statement khi complete quiz:
{
  verb: "completed",
  objectId: "h5p-quiz-123",
  result: {
    score: { raw: 8, max: 10, scaled: 0.8 },
    completion: true,
    duration: "PT5M30S"
  }
}
```

#### 🎤 AI Pronunciation Check
**UI Implementation:**
```
Text with pronunciation: "The weather is beautiful" 🎤

When clicked:
┌────────────────────────────────┐
│ Pronunciation Practice         │
├────────────────────────────────┤
│ Say: "The weather is beautiful"│
│                                │
│        ⭕ 🎤                   │
│     [Tap to record]            │
│                                │
│ Status: Ready to listen...     │
└────────────────────────────────┘

After recording:
┌────────────────────────────────┐
│ ✅ Great job! Score: 92/100    │
├────────────────────────────────┤
│ Your pronunciation:             │
│ "The weather is beautiful"      │
│                                │
│ Feedback:                       │
│ ✅ weather - Perfect!           │
│ ⚠️  beautiful - Try again      │
│    [🔊 Listen to correct]      │
│                                │
│ [Try Again] [Next]             │
└────────────────────────────────┘
```

**Technical Flow:**
```javascript
// 1. User clicks 🎤 icon
// 2. Request microphone permission
// 3. Record audio (Web Speech API / external service)
// 4. Send to pronunciation API
// 5. Receive feedback & score
// 6. Track event:

POST /tracking {
  verb: "attempted",
  objectId: "pronunciation-weather-sentence",
  result: {
    score: { raw: 92, max: 100 },
    success: true,
    response: "user's audio transcription"
  }
}
```

---

## 👨‍🏫 Giao diện cho Giáo viên (Teacher Interface)

### 📊 Analytics Dashboard
**Endpoints:** 
- `GET /tracking/analytics` - Overall analytics
- `GET /users/role/STUDENT` - List students
- `GET /epub/stats` - Content statistics
- `GET /tracking/progress/{userId}` - Individual progress

#### 📈 Dashboard Layout
```
┌─────────────────────────────────────────────────────────┐
│ Teacher Dashboard | Class: Advanced English 2025        │
│ [Students] [Content] [Analytics] [Settings]       [🔔]  │
├─────────────────────────────────────────────────────────┤
│ Quick Stats:                                            │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│ │ 👥 45    │ │ 📚 128   │ │ 📊 87%   │ │ 🎮 15    │  │
│ │ Active   │ │ Books    │ │ Avg      │ │ H5P      │  │
│ │ Students │ │ Completed│ │ Progress │ │ Content  │  │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
├─────────────────────────────────────────────────────────┤
│ 📊 Learning Analytics                [Week ▼] [Export] │
│ ┌───────────────────────────────────────────────────┐  │
│ │ Reading Time (Hours)                              │  │
│ │ 25│              ╭─╮                              │  │
│ │ 20│           ╭──╯ ╰─╮                            │  │
│ │ 15│        ╭──╯      ╰──╮                         │  │
│ │ 10│     ╭──╯             ╰─╮                      │  │
│ │  5│  ╭──╯                  ╰──╮                   │  │
│ │  0└──────────────────────────────                 │  │
│ │    Mon Tue Wed Thu Fri Sat Sun                    │  │
│ └───────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│ 👥 Student Progress Overview           [Search...] 🔍  │
│ ┌─────────────────────────────────────────────────────┐│
│ │Name        │Book              │Progress│Last Active││
│ ├────────────┼──────────────────┼────────┼───────────┤│
│ │Alice J.    │Grammar Fund.     │███░ 90%│2 hrs ago  ││
│ │Bob M.      │Math Basics       │██░░ 45%│1 day ago  ││
│ │Carol S.    │Science World     │████ 78%│3 hrs ago  ││
│ │David L.    │History Tales     │█░░░ 23%│2 days ago ││
│ │⚠️ Emma K.  │English Basics    │░░░░  5%│7 days ago ││
│ └─────────────────────────────────────────────────────┘│
│ [View Details] [Send Message] [Export Report]          │
└─────────────────────────────────────────────────────────┘
```

#### 📊 Analytics Data Implementation
```javascript
// GET /tracking/analytics
{
  totalEvents: 1250,
  verbDistribution: [
    { verb: "completed", count: 450 },
    { verb: "experienced", count: 600 },
    { verb: "answered", count: 200 }
  ],
  activeUsers: 45,
  contentEngagement: [
    { contentId: "clxxx", title: "Grammar", interactions: 125 },
    { contentId: "clyyyy", title: "Math", interactions: 89 }
  ],
  timeDistribution: {
    monday: 145,
    tuesday: 167,
    // ... weekly data
  },
  averageScore: 87.3,
  completionRate: 76.5
}
```

#### 🎯 Student Detail View
```
┌─────────────────────────────────────────────────────┐
│ ← Back to Dashboard                                 │
├─────────────────────────────────────────────────────┤
│ 👤 Alice Johnson | alice.j@school.edu              │
│ Level: Advanced | Joined: Sep 1, 2025               │
├─────────────────────────────────────────────────────┤
│ 📊 Overview                                         │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│ │ 🔥 14    │ │ 📚 12    │ │ ⭐ 985   │           │
│ │ Day      │ │ Books    │ │ Points   │           │
│ │ Streak   │ │ Completed│ │ Earned   │           │
│ └──────────┘ └──────────┘ └──────────┘           │
│                                                     │
│ 📖 Reading History                                  │
│ ┌─────────────────────────────────────────────┐   │
│ │ Book Title          │ Progress │ Time Spent │   │
│ ├─────────────────────┼──────────┼───────────┤   │
│ │ ✅ Grammar Fund.    │ 100%     │ 5h 23m    │   │
│ │ 📖 Math Basics      │  90%     │ 3h 45m    │   │
│ │ 📖 Science World    │  78%     │ 2h 12m    │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ 🎯 Quiz Performance                                 │
│ ┌─────────────────────────────────────────────┐   │
│ │ Average Score: 92%                          │   │
│ │ ████████████████████▓▓                      │   │
│ │ Total Quizzes: 28 | Perfect Scores: 8      │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ 🕐 Activity Timeline (Last 7 days)                 │
│ ┌─────────────────────────────────────────────┐   │
│ │ Mon ████████████████ 2.5h                   │   │
│ │ Tue ████████████ 1.8h                       │   │
│ │ Wed ████████████████████ 3.2h               │   │
│ │ Thu ████████ 1.2h                           │   │
│ │ Fri ████████████████ 2.1h                   │   │
│ │ Sat ████ 0.5h                               │   │
│ │ Sun ████████████ 1.5h                       │   │
│ └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

**API Call:**
```javascript
// GET /users/{studentId}
// GET /tracking/progress/{studentId}
// Combine data để render complete view
```

### 📚 Content Management Interface

#### 📖 EPUB Upload & Management
**Endpoints:** 
- `POST /epub/upload` - Upload new book
- `GET /epub` - List all books
- `PATCH /epub/{id}` - Update book info
- `DELETE /epub/{id}` - Delete book

```
┌─────────────────────────────────────────────────────┐
│ Content Library | Books                              │
│ [+ Upload Book] [+ Create H5P]           [Search] 🔍│
├─────────────────────────────────────────────────────┤
│ Filters: [All] [Public] [Private] [My Content]     │
├─────────────────────────────────────────────────────┤
│ ┌─────────┬───────────────────────────────────────┐│
│ │ [Cover] │ English Grammar Fundamentals         ││
│ │         │ By: Dr. Emily Watson                 ││
│ │         │ 📊 45 students | 👁️ Public           ││
│ │         │ Uploaded: Oct 1, 2025                ││
│ │         │ [Edit] [Preview] [Stats] [Delete]   ││
│ └─────────┴───────────────────────────────────────┘│
│ ┌─────────┬───────────────────────────────────────┐│
│ │ [Cover] │ Mathematics 101                      ││
│ │         │ By: Prof. Michael Lee                ││
│ │         │ 📊 32 students | 🔒 Private          ││
│ │         │ Uploaded: Sep 28, 2025               ││
│ │         │ [Edit] [Preview] [Stats] [Delete]   ││
│ └─────────┴───────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

#### 📤 Upload Interface
```
┌─────────────────────────────────────────────┐
│ Upload New Book                             │
├─────────────────────────────────────────────┤
│                                             │
│        📁 Drag & Drop EPUB File            │
│           or click to browse               │
│                                             │
│        Supported: .epub (max 100MB)        │
│                                             │
├─────────────────────────────────────────────┤
│ Uploading: grammar-book.epub                │
│ ████████████████████░░░░░░░░ 75%          │
│ 3.8 MB / 5.1 MB                            │
└─────────────────────────────────────────────┘

After upload:
┌─────────────────────────────────────────────┐
│ ✅ Upload Successful!                       │
├─────────────────────────────────────────────┤
│ Title: English Grammar Fundamentals         │
│ Author: Dr. Emily Watson                    │
│ Chapters: 12                                │
│                                             │
│ Visibility: ○ Public  ● Private            │
│                                             │
│ Description:                                │
│ ┌─────────────────────────────────────────┐│
│ │ A comprehensive guide to English...     ││
│ │                                         ││
│ └─────────────────────────────────────────┘│
│                                             │
│ [Cancel] [Save & Publish]                  │
└─────────────────────────────────────────────┘
```

**Upload Flow:**
```javascript
// 1. Select file
// 2. POST /epub/upload (multipart/form-data)
const formData = new FormData();
formData.append('file', epubFile);

// Response includes extracted metadata:
{
  id: "clxxxxx",
  title: "English Grammar Fundamentals",
  author: "Dr. Emily Watson",
  coverImage: "/uploads/covers/auto-extracted.jpg",
  metadata: {
    language: "en",
    publisher: "Education Press",
    tableOfContents: [...]
  }
}

// 3. Edit details if needed
// 4. PATCH /epub/{id} to update
// 5. Done!
```

#### 🎮 H5P Content Creator
**Endpoints:**
- `GET /h5p/editor` - Get H5P editor data
- `POST /h5p` - Create new H5P content
- `PATCH /h5p/{id}` - Update content

```
┌─────────────────────────────────────────────────────┐
│ Create Interactive Content                          │
├─────────────────────────────────────────────────────┤
│ Content Type: [Question Set ▼]                     │
│                                                     │
│ Title: Grammar Practice Quiz                        │
│                                                     │
│ ┌─────────────────────────────────────────────────┐│
│ │ H5P EDITOR EMBEDDED HERE                        ││
│ │                                                 ││
│ │ Question 1:                                     ││
│ │ Question Text: [Which is correct?________]     ││
│ │                                                 ││
│ │ Answers:                                        ││
│ │ ✓ [I have gone there_____________] (Correct)   ││
│ │   [I have went there_____________]             ││
│ │   [I have go there_______________]             ││
│ │   [+ Add answer]                               ││
│ │                                                 ││
│ │ [+ Add Question]                               ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│ Settings:                                           │
│ ☑️ Show results at the end                         │
│ ☑️ Allow retry                                     │
│ Pass percentage: [70] %                            │
│                                                     │
│ Visibility: ○ Public  ● Private                    │
│                                                     │
│ [Save Draft] [Preview] [Publish]                   │
└─────────────────────────────────────────────────────┘
```

---

## 🛠️ Technical Implementation Details

### 🔐 Authentication System

#### Login Flow
```javascript
// 1. User enters credentials
POST /auth/login
{
  email: "student@example.com",
  password: "student123"
}

// 2. Receive JWT token
{
  user: {
    id: "clxxxxx",
    email: "student@example.com",
    firstName: "John",
    lastName: "Doe",
    role: "STUDENT"
  },
  access_token: "eyJhbGciOiJIUzI1NiIs..."
}

// 3. Store token
localStorage.setItem('token', access_token);
localStorage.setItem('user', JSON.stringify(user));

// 4. Add to all requests
axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
```

#### Protected Routes
```javascript
// React Router example
<Routes>
  <Route element={<ProtectedRoute role="STUDENT" />}>
    <Route path="/library" element={<Library />} />
    <Route path="/reader/:bookId" element={<Reader />} />
  </Route>
  
  <Route element={<ProtectedRoute role="TEACHER" />}>
    <Route path="/dashboard" element={<TeacherDashboard />} />
    <Route path="/content/upload" element={<Upload />} />
  </Route>
  
  <Route element={<ProtectedRoute role="ADMIN" />}>
    <Route path="/admin/*" element={<Admin />} />
  </Route>
</Routes>
```

### 📡 State Management Architecture

#### Redux Store Structure
```javascript
{
  auth: {
    user: {...},
    token: "...",
    isAuthenticated: true,
    loading: false
  },
  books: {
    list: [...],
    current: {...},
    loading: false,
    error: null
  },
  progress: {
    byBookId: {
      "book-1": { progress: 75, lastPosition: {...} },
      "book-2": { progress: 45, lastPosition: {...} }
    }
  },
  tracking: {
    events: [...],
    analytics: {...}
  },
  ui: {
    readerSettings: {
      fontSize: 18,
      fontFamily: "serif",
      theme: "light",
      lineHeight: 1.6
    },
    sidebarOpen: true
  }
}
```

#### React Query / SWR Example
```javascript
// Fetch books with caching
const { data: books, isLoading } = useQuery(
  ['books'],
  () => axios.get('/epub').then(res => res.data),
  {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000
  }
);

// Fetch progress with polling
const { data: progress } = useQuery(
  ['progress', userId],
  () => axios.get(`/tracking/progress/${userId}`).then(res => res.data),
  {
    refetchInterval: 30000, // Refresh every 30s
    enabled: !!userId
  }
);
```

### 🎨 Component Architecture

```
src/
├── components/
│   ├── student/
│   │   ├── Library/
│   │   │   ├── BookCard.tsx
│   │   │   ├── BookGrid.tsx
│   │   │   ├── ProgressRing.tsx
│   │   │   └── AchievementBadge.tsx
│   │   ├── Reader/
│   │   │   ├── EpubViewer.tsx
│   │   │   ├── TableOfContents.tsx
│   │   │   ├── ReadingToolbar.tsx
│   │   │   ├── TypographySettings.tsx
│   │   │   ├── BookmarkPanel.tsx
│   │   │   └── PronunciationModal.tsx
│   │   └── H5P/
│   │       ├── H5PEmbed.tsx
│   │       └── H5PTracker.tsx
│   ├── teacher/
│   │   ├── Dashboard/
│   │   │   ├── AnalyticsOverview.tsx
│   │   │   ├── StatsCards.tsx
│   │   │   ├── ActivityChart.tsx
│   │   │   └── StudentTable.tsx
│   │   ├── StudentDetail/
│   │   │   ├── StudentProfile.tsx
│   │   │   ├── ProgressChart.tsx
│   │   │   └── ActivityTimeline.tsx
│   │   └── Content/
│   │       ├── ContentLibrary.tsx
│   │       ├── EpubUploader.tsx
│   │       ├── H5PEditor.tsx
│   │       └── ContentCard.tsx
│   ├── shared/
│   │   ├── Auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── Layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   ├── UI/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── Spinner.tsx
│   │   └── Icons/
│   │       └── index.tsx
│   └── ...
├── hooks/
│   ├── useAuth.ts
│   ├── useProgress.ts
│   ├── useTracking.ts
│   ├── useEpubReader.ts
│   └── useAnalytics.ts
├── services/
│   ├── api.ts
│   ├── auth.service.ts
│   ├── epub.service.ts
│   ├── h5p.service.ts
│   └── tracking.service.ts
├── store/
│   ├── slices/
│   │   ├── authSlice.ts
│   │   ├── booksSlice.ts
│   │   ├── progressSlice.ts
│   │   └── uiSlice.ts
│   └── store.ts
├── utils/
│   ├── constants.ts
│   ├── helpers.ts
│   └── validators.ts
└── types/
    ├── auth.types.ts
    ├── book.types.ts
    ├── tracking.types.ts
    └── index.ts
```

### 📊 Progress Tracking Implementation

#### Auto-save Progress
```javascript
// Custom hook for progress tracking
const useProgressTracker = (bookId: string) => {
  const [position, setPosition] = useState({
    chapter: '',
    scrollPosition: 0,
    percentage: 0
  });

  // Save progress every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveProgress();
    }, 30000);

    return () => clearInterval(interval);
  }, [position]);

  // Save on unmount
  useEffect(() => {
    return () => {
      saveProgress();
    };
  }, []);

  const saveProgress = async () => {
    try {
      await axios.post('/tracking', {
        verb: 'experienced',
        objectId: position.chapter,
        contentId: bookId,
        result: {
          progress: position.percentage,
          duration: calculateDuration()
        },
        context: {
          scrollPosition: position.scrollPosition,
          device: navigator.userAgent
        }
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  return { position, setPosition, saveProgress };
};
```

#### Calculate Progress
```javascript
const calculateBookProgress = (trackingEvents: TrackingEvent[]) => {
  // Get all "experienced" events for this book
  const readingEvents = trackingEvents.filter(
    e => e.verb === 'experienced' && e.contentId === bookId
  );

  // Get unique chapters read
  const chaptersRead = new Set(readingEvents.map(e => e.objectId));
  
  // Calculate percentage
  const progress = (chaptersRead.size / totalChapters) * 100;
  
  // Get last reading position
  const lastEvent = readingEvents[readingEvents.length - 1];
  const lastPosition = lastEvent?.context?.scrollPosition || 0;
  
  return {
    progress: Math.round(progress),
    lastChapter: lastEvent?.objectId,
    lastPosition,
    chaptersCompleted: chaptersRead.size,
    totalChapters
  };
};
```

### 🎯 Performance Optimization

#### 1. Code Splitting
```javascript
// Lazy load routes
const Library = lazy(() => import('./pages/Library'));
const Reader = lazy(() => import('./pages/Reader'));
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'));

// Suspense wrapper
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/library" element={<Library />} />
    <Route path="/reader/:id" element={<Reader />} />
  </Routes>
</Suspense>
```

#### 2. Image Optimization
```javascript
// Use Next.js Image component or similar
<Image
  src={book.coverImage}
  alt={book.title}
  width={200}
  height={267}
  loading="lazy"
  placeholder="blur"
/>

// Or generate multiple sizes on backend
coverImages: {
  thumbnail: '/covers/book-thumb.jpg',  // 100x133
  small: '/covers/book-small.jpg',      // 200x267
  medium: '/covers/book-medium.jpg',    // 400x533
  large: '/covers/book-large.jpg'       // 800x1067
}
```

#### 3. Caching Strategy
```javascript
// Service Worker for offline reading
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/epub/')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((response) => {
          return caches.open('epub-cache').then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
  }
});
```

#### 4. Virtual Scrolling
```javascript
// For long book content and large lists
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={students.length}
  itemSize={80}
  width="100%"
>
  {({ index, style }) => (
    <StudentRow 
      student={students[index]} 
      style={style}
    />
  )}
</FixedSizeList>
```

---

## 🎨 Design System

### 🎨 Color Palette
```css
:root {
  /* Primary Colors */
  --primary-50: #ECFDF5;
  --primary-100: #D1FAE5;
  --primary-500: #10B981; /* Main primary */
  --primary-600: #059669;
  --primary-700: #047857;
  
  /* Secondary Colors */
  --secondary-50: #FEF3C7;
  --secondary-500: #F59E0B; /* Main secondary */
  --secondary-600: #D97706;
  
  /* Accent Colors */
  --accent-500: #3B82F6; /* Blue */
  --success-500: #22C55E; /* Green */
  --warning-500: #EF4444; /* Red */
  
  /* Neutral Colors */
  --gray-50: #FAFAFA;
  --gray-100: #F5F5F5;
  --gray-200: #E5E5E5;
  --gray-300: #D4D4D4;
  --gray-500: #737373;
  --gray-700: #404040;
  --gray-900: #171717;
  
  /* Text Colors */
  --text-primary: #1F2937;
  --text-secondary: #6B7280;
  --text-tertiary: #9CA3AF;
  
  /* Background Colors */
  --bg-primary: #FFFFFF;
  --bg-secondary: #F9FAFB;
  --bg-tertiary: #F3F4F6;
  
  /* Surface Colors */
  --surface: #FFFFFF;
  --surface-hover: #F9FAFB;
  
  /* Border Colors */
  --border-light: #E5E7EB;
  --border-medium: #D1D5DB;
  --border-dark: #9CA3AF;
}

/* Dark Mode */
[data-theme="dark"] {
  --text-primary: #F9FAFB;
  --text-secondary: #D1D5DB;
  --bg-primary: #1F2937;
  --bg-secondary: #111827;
  --surface: #374151;
  --border-light: #4B5563;
}
```

### 📝 Typography System
```css
/* Font Families */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-serif: 'Georgia', 'Times New Roman', serif;
--font-mono: 'Fira Code', 'Courier New', monospace;

/* Font Sizes */
--text-xs: 0.75rem;      /* 12px - Metadata, captions */
--text-sm: 0.875rem;     /* 14px - Small text */
--text-base: 1rem;       /* 16px - Body text */
--text-lg: 1.125rem;     /* 18px - Reading body */
--text-xl: 1.25rem;      /* 20px - Large text */
--text-2xl: 1.5rem;      /* 24px - Headings */
--text-3xl: 1.875rem;    /* 30px - Large headings */
--text-4xl: 2.25rem;     /* 36px - Display */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 1.75;
```

### 📏 Spacing Scale
```css
--spacing-0: 0;
--spacing-1: 0.25rem;    /* 4px */
--spacing-2: 0.5rem;     /* 8px */
--spacing-3: 0.75rem;    /* 12px */
--spacing-4: 1rem;       /* 16px */
--spacing-5: 1.25rem;    /* 20px */
--spacing-6: 1.5rem;     /* 24px */
--spacing-8: 2rem;       /* 32px */
--spacing-10: 2.5rem;    /* 40px */
--spacing-12: 3rem;      /* 48px */
--spacing-16: 4rem;      /* 64px */
```

### 🔲 Border Radius
```css
--radius-sm: 0.375rem;   /* 6px - Small elements */
--radius-md: 0.5rem;     /* 8px - Buttons, inputs */
--radius-lg: 0.75rem;    /* 12px - Cards */
--radius-xl: 1rem;       /* 16px - Modals */
--radius-full: 9999px;   /* Circular */
```

### 🌑 Shadows
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

### 🎬 Animations
```css
/* Transitions */
--transition-fast: 150ms ease;
--transition-base: 200ms ease;
--transition-slow: 300ms ease;

/* Keyframes */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### 🔘 Button Styles
```css
.btn {
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
  transition: var(--transition-base);
  cursor: pointer;
}

.btn-primary {
  background: var(--primary-500);
  color: white;
}
.btn-primary:hover {
  background: var(--primary-600);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-secondary {
  background: var(--secondary-500);
  color: white;
}

.btn-outline {
  background: transparent;
  border: 2px solid var(--primary-500);
  color: var(--primary-500);
}
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile First Approach */
/* Extra Small (xs): < 640px (default) */

/* Small (sm): ≥ 640px */
@media (min-width: 640px) {
  .book-grid { grid-template-columns: repeat(2, 1fr); }
}

/* Medium (md): ≥ 768px */
@media (min-width: 768px) {
  .book-grid { grid-template-columns: repeat(3, 1fr); }
  .sidebar { display: block; }
}

/* Large (lg): ≥ 1024px */
@media (min-width: 1024px) {
  .book-grid { grid-template-columns: repeat(4, 1fr); }
  .dashboard { grid-template-columns: 250px 1fr; }
}

/* Extra Large (xl): ≥ 1280px */
@media (min-width: 1280px) {
  .book-grid { grid-template-columns: repeat(5, 1fr); }
}
```

---

## ♿ Accessibility (A11y)

### Essential Requirements
```html
<!-- Semantic HTML -->
<header>
  <nav aria-label="Main navigation">
    <ul>
      <li><a href="/library">Library</a></li>
    </ul>
  </nav>
</header>

<main>
  <h1>My Library</h1>
  <!-- Content -->
</main>

<!-- ARIA Labels -->
<button aria-label="Next chapter">→</button>
<div role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">
  75% Complete
</div>

<!-- Focus Indicators -->
*:focus {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}

<!-- Keyboard Navigation -->
<div 
  role="button" 
  tabindex="0"
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  Click me
</div>

<!-- Screen Reader Text -->
<span class="sr-only">
  Progress: 75 percent complete
</span>
```

### Color Contrast
- Text must have 4.5:1 contrast ratio minimum
- Large text (18pt+) needs 3:1 minimum
- Test with tools like WAVE or axe DevTools

---

## 🧪 Testing Strategy

### Unit Tests
```javascript
// Example: BookCard.test.tsx
describe('BookCard', () => {
  it('renders book information correctly', () => {
    const book = {
      title: 'Test Book',
      author: 'Test Author',
      progress: 75
    };
    
    render(<BookCard book={book} />);
    
    expect(screen.getByText('Test Book')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });
  
  it('calls onClick when continue button is clicked', () => {
    const handleClick = jest.fn();
    render(<BookCard book={mockBook} onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('Continue'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Integration Tests
```javascript
// Example: Login flow
describe('Authentication', () => {
  it('should login successfully', async () => {
    // Mock API
    mockAxios.post.mockResolvedValueOnce({
      data: { access_token: 'fake-token', user: {...} }
    });
    
    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByText('Login'));
    
    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('fake-token');
      expect(window.location.pathname).toBe('/library');
    });
  });
});
```

### E2E Tests (Cypress)
```javascript
// cypress/e2e/reading-flow.cy.js
describe('Reading Flow', () => {
  beforeEach(() => {
    cy.login('student@example.com', 'password123');
  });
  
  it('should complete a full reading session', () => {
    // Navigate to library
    cy.visit('/library');
    
    // Click on a book
    cy.contains('English Grammar').click();
    
    // Reader should load
    cy.url().should('include', '/reader/');
    cy.contains('Chapter 1').should('be.visible');
    
    // Complete H5P quiz
    cy.get('.h5p-question').first().click();
    cy.contains('Check Answer').click();
    
    // Progress should update
    cy.get('.progress-bar').should('have.attr', 'aria-valuenow', '10');
  });
});
```

---

## 📦 Deliverables Checklist

### 🎨 Design Phase
- [ ] User journey maps (Student & Teacher flows)
- [ ] Wireframes (Low-fidelity sketches)
- [ ] High-fidelity mockups (All screens, Desktop + Mobile)
- [ ] Interactive prototype (Figma/Adobe XD)
- [ ] Design system documentation
  - [ ] Color palette with usage guidelines
  - [ ] Typography scale
  - [ ] Component library
  - [ ] Icon set (SVG format)
  - [ ] Spacing & layout grid
- [ ] Animation specifications
- [ ] Illustration assets
- [ ] Brand guidelines

### 💻 Development Phase
- [ ] Component library (Storybook)
- [ ] API integration layer
- [ ] Authentication & authorization
- [ ] Student interface
  - [ ] Library/Dashboard
  - [ ] EPUB Reader
  - [ ] H5P Integration
  - [ ] Progress tracking
  - [ ] Gamification features
- [ ] Teacher interface
  - [ ] Analytics dashboard
  - [ ] Student monitoring
  - [ ] Content management
  - [ ] Upload functionality
- [ ] Responsive implementation (Mobile/Tablet/Desktop)
- [ ] Dark mode support
- [ ] Accessibility compliance (WCAG 2.1 AA)
- [ ] Performance optimization
- [ ] Error handling & loading states
- [ ] Offline support (PWA)

### 🧪 Testing Phase
- [ ] Unit tests (>80% coverage)
- [ ] Integration tests
- [ ] E2E tests (Critical user flows)
- [ ] Accessibility audit
- [ ] Performance testing
- [ ] Cross-browser testing
- [ ] Mobile device testing
- [ ] User acceptance testing

### 📝 Documentation Phase
- [ ] User guide (Student)
- [ ] User guide (Teacher)
- [ ] Technical documentation
- [ ] API integration guide
- [ ] Deployment guide
- [ ] Maintenance guide

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Setup project structure
- [ ] Implement authentication
- [ ] Create design system / component library
- [ ] Setup state management
- [ ] Configure API client

### Phase 2: Student Experience (Weeks 3-5)
- [ ] Build library/dashboard
- [ ] Implement EPUB reader
- [ ] Add progress tracking
- [ ] Integrate H5P content
- [ ] Add gamification elements

### Phase 3: Teacher Experience (Weeks 6-7)
- [ ] Build analytics dashboard
- [ ] Create content management interface
- [ ] Implement upload functionality
- [ ] Add student monitoring tools

### Phase 4: Polish & Testing (Week 8)
- [ ] Mobile optimization
- [ ] Accessibility improvements
- [ ] Performance optimization
- [ ] Bug fixes
- [ ] User testing

### Phase 5: Launch (Week 9)
- [ ] Final testing
- [ ] Documentation
- [ ] Deployment
- [ ] Training materials

---

## 🎯 Success Metrics

### Student Engagement
- Average reading time per session: **Target: 20+ minutes**
- Book completion rate: **Target: 60%+**
- H5P quiz participation: **Target: 80%+**
- Daily active users: **Target: 70%+ of enrolled students**
- Reading streak maintenance: **Target: 50%+ maintain 7+ days**

### Learning Outcomes
- Average quiz score: **Target: 75%+**
- Content mastery: **Target: 80%+ completion on interactive elements**
- Progress consistency: **Target: 70%+ weekly active learners**

### Teacher Adoption
- Content upload rate: **Target: 5+ books per teacher per semester**
- Dashboard usage: **Target: 90%+ weekly active teachers**
- Student progress reviews: **Target: 2+ times per week**

### Technical Performance
- Page load time: **< 2 seconds**
- API response time: **< 500ms (p95)**
- Uptime: **99.9%+**
- Mobile performance score: **90+**

---

## 🎯 Mục tiêu cuối cùng

Tạo ra một nền tảng e-learning **intuitive**, **engaging**, và **powerful** - nơi mà:

✅ **Học sinh yêu thích việc đọc và học tập**
- Trải nghiệm đọc sách không bị gián đoạn
- Gamification tạo động lực học tập
- Progress tracking giúp theo dõi tiến độ

✅ **Giáo viên dễ dàng quản lý và giảng dạy**
- Dashboard cung cấp insights rõ ràng
- Upload content nhanh chóng
- Theo dõi học sinh real-time

✅ **Hệ thống hoạt động mượt mà**
- Backend NestJS robust và scalable
- API RESTful được document đầy đủ
- Tracking system với xAPI standards
- Security với JWT authentication

---

**🎉 Happy Building!**

Nếu có bất kỳ câu hỏi nào về implementation, vui lòng tham khảo:
- API Documentation: `/backendd/API_DOCUMENTATION.md`
- Database Schema: `/backendd/prisma/schema.prisma`
- Sample Data: Chạy `npm run db:seed` để có dữ liệu mẫu

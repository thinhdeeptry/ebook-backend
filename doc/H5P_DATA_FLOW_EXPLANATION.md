# Luồng Hoạt Động và Xử Lý Dữ Liệu H5P

## Tổng Quan Kiến Trúc

Hệ thống H5P được xây dựng dựa trên kiến trúc 3 tầng:

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                        │
│  - H5P Editor Component                                      │
│  - H5P Player Component                                      │
│  - User Interface                                            │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTP/REST API
                  │ JWT Authentication
┌─────────────────▼───────────────────────────────────────────┐
│              BACKEND (NestJS) - API Layer                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           H5P Controller                              │   │
│  │  - Request validation                                 │   │
│  │  - Authentication/Authorization                       │   │
│  │  - Route handling                                     │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                      │
│  ┌────────────────────▼─────────────────────────────────┐   │
│  │           H5P Service Layer                           │   │
│  │  ┌─────────────────────────────────────────────┐     │   │
│  │  │  H5P Basic Service                          │     │   │
│  │  │  - Content validation                       │     │   │
│  │  │  - Editor/Player model generation          │     │   │
│  │  │  - Business logic orchestration            │     │   │
│  │  └──────────────┬──────────────────────────────┘     │   │
│  │                 │                                     │   │
│  │  ┌──────────────▼──────────────────────────────┐     │   │
│  │  │  H5P Storage Services                       │     │   │
│  │  │  - Content Storage (Database)               │     │   │
│  │  │  - Library Storage (Database)               │     │   │
│  │  │  - Temporary Storage (File System)          │     │   │
│  │  └──────────────┬──────────────────────────────┘     │   │
│  │                 │                                     │   │
│  │  ┌──────────────▼──────────────────────────────┐     │   │
│  │  │  H5P Config Service                         │     │   │
│  │  │  - System configuration                     │     │   │
│  │  │  - Path management                          │     │   │
│  │  └─────────────────────────────────────────────┘     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│           DATA PERSISTENCE LAYER                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  PostgreSQL Database (via Prisma ORM)                │   │
│  │  - H5PContent table                                  │   │
│  │  - H5PLibrary table                                  │   │
│  │  - H5PTemporaryFile table                            │   │
│  │  - User relationship                                 │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  File System                                         │   │
│  │  - uploads/h5p/content/                              │   │
│  │  - uploads/h5p/libraries/                            │   │
│  │  - uploads/h5p/temp/                                 │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

---

## 1. Luồng Tạo Nội Dung H5P Mới (Create Content Flow)

### Bước 1: Teacher Mở H5P Editor

```
┌─────────────┐
│  Teacher    │
│  Browser    │
└──────┬──────┘
       │ 1. Request: GET /h5p/editor?language=en
       │    Authorization: Bearer {JWT_TOKEN}
       ▼
┌──────────────────┐
│  H5P Controller  │
│  - Verify JWT    │
│  - Check Role    │ ──────────────┐
└──────┬───────────┘                │
       │                            │ Teacher/Admin?
       │ 2. Call getEditorModel()   │
       ▼                            ▼
┌──────────────────┐           ┌─────────────┐
│  H5P Service     │           │   Return     │
│  - Load libraries│           │   403        │
│  - Generate UI   │           │ Forbidden    │
└──────┬───────────┘           └─────────────┘
       │
       │ 3. Response: Editor Integration Data
       │    {
       │      libraries: [...available H5P types],
       │      settings: {...editor config},
       │      integration: {...H5P core settings}
       │    }
       ▼
┌─────────────┐
│  Frontend   │
│  Initializes│
│  H5P Editor │
└─────────────┘
```

**Chi tiết xử lý trong code:**

```typescript
// h5p.controller.ts
@Get('editor')
@UseGuards(RolesGuard)
@Roles(Role.TEACHER, Role.ADMIN)
async getEditorIntegration(
  @Query('contentId') contentId?: string,
  @Query('language') language: string = 'en',
) {
  // 1. Verify authentication (automatically by Guards)
  // 2. Check role permission (TEACHER or ADMIN only)
  
  // 3. Get editor model from service
  const model = await this.h5pService.getEditorModel(contentId, language);
  
  return {
    success: true,
    data: model,
  };
}
```

```typescript
// h5p-basic.service.ts
async getEditorModel(contentId?: string, language: string = 'en') {
  // 1. Load available H5P libraries from database
  const libraries = await this.libraryStorage.getInstalledLibraries();
  
  // 2. If editing existing content, load content data
  let contentData = null;
  if (contentId) {
    contentData = await this.contentStorage.getContent(contentId);
  }
  
  // 3. Generate editor integration object
  return {
    libraries: libraries.map(lib => ({
      name: lib.name,
      title: lib.title,
      majorVersion: lib.majorVersion,
      minorVersion: lib.minorVersion,
      patchVersion: lib.patchVersion,
    })),
    content: contentData,
    language,
    baseUrl: this.config.baseUrl,
    ajaxPath: '/h5p/ajax/',
  };
}
```

---

### Bước 2: Teacher Tạo Content và Lưu

```
┌─────────────┐
│  Teacher    │
│  Creates    │
│  Content    │
└──────┬──────┘
       │
       │ 1. User fills H5P editor form
       │    - Select content type (e.g., Interactive Video)
       │    - Configure parameters
       │    - Add media files
       │    - Set metadata
       │
       │ 2. Click "Save"
       │
       │ 3. Frontend validates and sends:
       │    POST /h5p/content
       │    Authorization: Bearer {JWT_TOKEN}
       │    Body: {
       │      library: "H5P.InteractiveVideo 1.26",
       │      params: {...content parameters},
       │      metadata: {...content metadata}
       │    }
       ▼
┌───────────────────────────────────────────────────────────┐
│  H5P Controller                                           │
│  1. Authenticate request                                  │
│  2. Verify user is TEACHER or ADMIN                       │
│  3. Extract user ID from JWT                              │
└──────┬────────────────────────────────────────────────────┘
       │
       │ 4. Call h5pService.createContent()
       ▼
┌───────────────────────────────────────────────────────────┐
│  H5P Service - createContent()                            │
│                                                           │
│  Step 1: VALIDATE CONTENT                                │
│  ┌─────────────────────────────────────────────┐         │
│  │ await validateContent({                     │         │
│  │   library: "H5P.InteractiveVideo 1.26",     │         │
│  │   params: {...}                             │         │
│  │ })                                          │         │
│  │                                             │         │
│  │ - Check library exists in database          │         │
│  │ - Validate library version compatibility    │         │
│  │ - Verify params structure                   │         │
│  │ - Check required fields                     │         │
│  └─────────────────────────────────────────────┘         │
│                                                           │
│  Step 2: SAVE TO DATABASE                                │
│  ┌─────────────────────────────────────────────┐         │
│  │ await contentStorage.createContent({        │         │
│  │   library: "H5P.InteractiveVideo 1.26",     │         │
│  │   params: JSON,                             │         │
│  │   metadata: JSON,                           │         │
│  │   uploaderId: userId                        │         │
│  │ })                                          │         │
│  │                                             │         │
│  │ Database Transaction:                       │         │
│  │ INSERT INTO h5p_contents                    │         │
│  │   (id, title, library, params, metadata,    │         │
│  │    uploaderId, createdAt, updatedAt)        │         │
│  │ VALUES                                      │         │
│  │   (uuid, 'My Video', 'H5P.Interactive...',  │         │
│  │    {...}, {...}, userId, NOW(), NOW())      │         │
│  └─────────────────────────────────────────────┘         │
│                                                           │
│  Step 3: PROCESS FILES (if any)                          │
│  ┌─────────────────────────────────────────────┐         │
│  │ If content contains uploaded files:         │         │
│  │ - Move from temp storage to content folder  │         │
│  │ - Update file references in params          │         │
│  │ - Clean up temporary files                  │         │
│  └─────────────────────────────────────────────┘         │
└──────┬────────────────────────────────────────────────────┘
       │
       │ 5. Return created content with ID
       │    {
       │      success: true,
       │      data: {
       │        id: "content_uuid_123",
       │        title: "My Interactive Video",
       │        library: "H5P.InteractiveVideo 1.26",
       │        createdAt: "2025-10-03T10:00:00Z",
       │        ...
       │      }
       │    }
       ▼
┌─────────────┐
│  Frontend   │
│  Shows      │
│  Success    │
│  Saves ID   │
└─────────────┘
```

**Chi tiết lưu trữ Database:**

```sql
-- Table: h5p_contents
CREATE TABLE h5p_contents (
    id VARCHAR PRIMARY KEY,           -- UUID generated by system
    title VARCHAR NOT NULL,           -- User-provided title
    library VARCHAR NOT NULL,         -- e.g., "H5P.InteractiveVideo"
    params JSONB NOT NULL,           -- Content parameters (structure varies by type)
    metadata JSONB NOT NULL,         -- Content metadata (title, author, license, etc.)
    file_path VARCHAR,               -- Path to uploaded .h5p file (if uploaded)
    is_public BOOLEAN DEFAULT false, -- Visibility setting
    uploader_id VARCHAR NOT NULL,    -- Foreign key to users table
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (uploader_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Example data:
{
    "id": "ckl1a2b3c4d5e6f7g8h9",
    "title": "Introduction to Biology",
    "library": "H5P.InteractiveVideo",
    "params": {
        "interactiveVideo": {
            "video": {
                "files": [
                    {
                        "path": "videos/biology-intro.mp4",
                        "mime": "video/mp4"
                    }
                ],
                "startScreenOptions": {
                    "title": "Welcome to Biology",
                    "hideStartTitle": false
                }
            },
            "assets": {
                "interactions": [
                    {
                        "x": 50,
                        "y": 50,
                        "duration": {"from": 10, "to": 15},
                        "action": {
                            "library": "H5P.MultiChoice 1.16",
                            "params": {
                                "question": "What is a cell?",
                                "answers": [...]
                            }
                        }
                    }
                ]
            }
        }
    },
    "metadata": {
        "title": "Introduction to Biology",
        "authors": [{"name": "John Teacher"}],
        "license": "CC BY-SA",
        "defaultLanguage": "en"
    },
    "isPublic": false,
    "uploaderId": "teacher_user_id",
    "createdAt": "2025-10-03T10:00:00.000Z",
    "updatedAt": "2025-10-03T10:00:00.000Z"
}
```

---

## 2. Luồng Hiển Thị Nội Dung H5P (Play Content Flow)

### Bước 1: Student Xem Danh Sách Content

```
┌─────────────┐
│  Student    │
│  Browser    │
└──────┬──────┘
       │ 1. Request: GET /h5p/content
       │    Authorization: Bearer {JWT_TOKEN}
       ▼
┌──────────────────┐
│  H5P Controller  │
│  - Verify JWT    │
└──────┬───────────┘
       │
       │ 2. Call getUserContents(userId)
       ▼
┌──────────────────────────────────────────────┐
│  H5P Service - getUserContents()             │
│                                              │
│  Query Database:                             │
│  SELECT * FROM h5p_contents                  │
│  WHERE is_public = true                      │
│     OR uploader_id = :userId                 │
│  ORDER BY created_at DESC                    │
│                                              │
│  Returns list of accessible content          │
└──────┬───────────────────────────────────────┘
       │
       │ 3. Response: Array of content
       │    [
       │      {
       │        id: "content_1",
       │        title: "Biology Intro",
       │        library: "H5P.InteractiveVideo",
       │        isPublic: true,
       │        uploader: {...}
       │      },
       │      ...
       │    ]
       ▼
┌─────────────┐
│  Frontend   │
│  Displays   │
│  List       │
└─────────────┘
```

---

### Bước 2: Student Chơi Content

```
┌─────────────┐
│  Student    │
│  Clicks Play│
└──────┬──────┘
       │ 1. Request: GET /h5p/player/{contentId}
       │    Authorization: Bearer {JWT_TOKEN}
       ▼
┌──────────────────────────────────────────────────────────┐
│  H5P Controller - getPlayerIntegration()                 │
│  - No role restriction (all authenticated users)         │
└──────┬───────────────────────────────────────────────────┘
       │
       │ 2. Call getPlayerModel(contentId)
       ▼
┌──────────────────────────────────────────────────────────┐
│  H5P Service - getPlayerModel()                          │
│                                                          │
│  Step 1: LOAD CONTENT FROM DATABASE                      │
│  ┌────────────────────────────────────────────┐         │
│  │ SELECT * FROM h5p_contents                 │         │
│  │ WHERE id = :contentId                      │         │
│  │                                            │         │
│  │ Returns:                                   │         │
│  │ {                                          │         │
│  │   id: "content_123",                       │         │
│  │   library: "H5P.InteractiveVideo 1.26",    │         │
│  │   params: {...all content data},           │         │
│  │   metadata: {...content metadata}          │         │
│  │ }                                          │         │
│  └────────────────────────────────────────────┘         │
│                                                          │
│  Step 2: LOAD LIBRARY ASSETS                            │
│  ┌────────────────────────────────────────────┐         │
│  │ Get library dependencies:                  │         │
│  │ SELECT * FROM h5p_libraries                │         │
│  │ WHERE name = 'H5P.InteractiveVideo'        │         │
│  │   AND major_version = 1                    │         │
│  │   AND minor_version = 26                   │         │
│  │                                            │         │
│  │ Returns library with:                      │         │
│  │ - JavaScript files to load                 │         │
│  │ - CSS files to load                        │         │
│  │ - Dependencies (other libraries needed)    │         │
│  └────────────────────────────────────────────┘         │
│                                                          │
│  Step 3: GENERATE INTEGRATION OBJECT                    │
│  ┌────────────────────────────────────────────┐         │
│  │ Create H5P integration config:             │         │
│  │ {                                          │         │
│  │   contents: {                              │         │
│  │     "h5p-content-123": {                   │         │
│  │       library: "H5P.InteractiveVideo 1.26",│         │
│  │       jsonContent: params,                 │         │
│  │       metadata: metadata,                  │         │
│  │       contentUrl: "/h5p/content/123",      │         │
│  │       scripts: [...js files],              │         │
│  │       styles: [...css files]               │         │
│  │     }                                      │         │
│  │   },                                       │         │
│  │   url: "/h5p",                             │         │
│  │   postUserStatistics: true,                │         │
│  │   ajax: {                                  │         │
│  │     setFinished: "/h5p/ajax/setFinished",  │         │
│  │     contentUserData: "/h5p/ajax/contentUserData" │
│  │   }                                        │         │
│  │ }                                          │         │
│  └────────────────────────────────────────────┘         │
└──────┬───────────────────────────────────────────────────┘
       │
       │ 3. Response: Player Integration Data
       ▼
┌───────────────────────────────────────────────────┐
│  Frontend                                         │
│  1. Loads H5P Player JavaScript                   │
│  2. Initializes H5P.init() with integration data  │
│  3. Renders interactive content                   │
│  4. Sets up event listeners for interactions      │
└───────────────────────────────────────────────────┘
```

---

## 3. Luồng Lưu Tương Tác và Tiến Trình (User Interaction Flow)

### Khi Student Tương Tác với H5P Content

```
┌─────────────────────────────────────────────────────┐
│  Student interacts with H5P Content                 │
│  - Answers quiz question                            │
│  - Watches video to certain timestamp               │
│  - Completes task                                   │
└──────┬──────────────────────────────────────────────┘
       │
       │ H5P Player JavaScript automatically triggers:
       │
       ├──────────────────────────────────────────┐
       │                                          │
       │ EVENT 1: Save Progress                   │ EVENT 2: Mark Finished
       │                                          │
       ▼                                          ▼
┌──────────────────────────┐            ┌─────────────────────────┐
│ POST /h5p/ajax/          │            │ POST /h5p/ajax/         │
│      contentUserData     │            │      setFinished        │
│                          │            │                         │
│ Body: {                  │            │ Body: {                 │
│   contentId: "123",      │            │   contentId: "123",     │
│   dataType: "state",     │            │   score: 85,            │
│   subContentId: 0,       │            │   maxScore: 100,        │
│   data: JSON string      │            │   opened: timestamp,    │
│ }                        │            │   finished: timestamp,  │
│                          │            │   time: 900 (seconds)   │
│ Purpose:                 │            │ }                       │
│ - Save current state     │            │                         │
│ - Resume from where left │            │ Purpose:                │
│ - Track partial progress │            │ - Record completion     │
└──────┬───────────────────┘            │ - Save final score      │
       │                                │ - Track time spent      │
       │                                └──────┬──────────────────┘
       │                                       │
       │ Both handled by:                      │
       │ processAjaxRequest()                  │
       │                                       │
       ▼                                       ▼
┌────────────────────────────────────────────────────────┐
│  H5P Controller - processAjaxRequest()                 │
│  - No role restriction (all authenticated users)       │
│  - Extract user ID from JWT                            │
└──────┬─────────────────────────────────────────────────┘
       │
       │ Route to appropriate handler based on action
       ▼
┌────────────────────────────────────────────────────────┐
│  H5P Service - processAjaxRequest()                    │
│                                                        │
│  CASE 1: contentUserData                              │
│  ┌──────────────────────────────────────────┐         │
│  │ Save user's interaction data              │         │
│  │                                           │         │
│  │ Could store in:                           │         │
│  │ 1. Separate user_data table:              │         │
│  │    INSERT INTO h5p_user_data              │         │
│  │    (user_id, content_id, data_type,       │         │
│  │     sub_content_id, data, timestamp)      │         │
│  │    VALUES (userId, contentId, 'state',    │         │
│  │           0, JSON data, NOW())            │         │
│  │    ON CONFLICT (user_id, content_id)      │         │
│  │    DO UPDATE SET data = EXCLUDED.data     │         │
│  │                                           │         │
│  │ 2. Or integrate with tracking system:     │         │
│  │    CREATE tracking_event with verb:       │         │
│  │    "progressed", "answered", etc.         │         │
│  └──────────────────────────────────────────┘         │
│                                                        │
│  CASE 2: setFinished                                  │
│  ┌──────────────────────────────────────────┐         │
│  │ Record completion event                   │         │
│  │                                           │         │
│  │ 1. Store in tracking system:              │         │
│  │    INSERT INTO tracking_events            │         │
│  │    (user_id, verb, object_id, result,     │         │
│  │     context, timestamp)                   │         │
│  │    VALUES                                 │         │
│  │    (userId, 'completed', contentId,       │         │
│  │     {score: 85, maxScore: 100},           │         │
│  │     {duration: 900}, NOW())               │         │
│  │                                           │         │
│  │ 2. Update user statistics:                │         │
│  │    - Increment completed_content_count     │         │
│  │    - Update average_score                 │         │
│  │    - Track learning progress              │         │
│  └──────────────────────────────────────────┘         │
└────────────────────────────────────────────────────────┘
```

**Chi tiết cấu trúc dữ liệu interaction:**

```typescript
// User Data Structure (saved during interaction)
interface H5PUserData {
  userId: string;
  contentId: string;
  dataType: 'state' | 'score' | 'answers';
  subContentId: number; // For nested content (e.g., questions in a quiz)
  data: string; // JSON stringified data
  timestamp: Date;
}

// Example saved state:
{
  userId: "student_123",
  contentId: "content_456",
  dataType: "state",
  subContentId: 0,
  data: JSON.stringify({
    progress: 75,           // 75% complete
    currentSlide: 5,        // On slide 5
    videoTimestamp: 180,    // At 3:00 in video
    answers: {
      question_1: ["option_a"],
      question_2: ["option_b", "option_c"]
    },
    bookmarks: [30, 60, 120], // User bookmarks at these timestamps
  }),
  timestamp: new Date("2025-10-03T10:30:00Z")
}

// Completion Event Structure
interface H5PCompletionEvent {
  userId: string;
  contentId: string;
  score: number;
  maxScore: number;
  opened: number;    // Unix timestamp when started
  finished: number;  // Unix timestamp when finished
  time: number;      // Total time spent in seconds
}

// Example completion event:
{
  userId: "student_123",
  contentId: "content_456",
  score: 85,
  maxScore: 100,
  opened: 1696204800,    // Started at timestamp
  finished: 1696205700,  // Finished at timestamp
  time: 900              // Spent 15 minutes (900 seconds)
}
```

---

## 4. Luồng Upload File H5P (.h5p package)

```
┌─────────────┐
│  Teacher    │
│  Has .h5p   │
│  File       │
└──────┬──────┘
       │
       │ 1. User selects .h5p file from computer
       │    File structure inside .h5p (it's a ZIP):
       │    ├── h5p.json (metadata)
       │    ├── content/
       │    │   ├── content.json (content params)
       │    │   └── [media files]
       │    └── [library folders]/
       │
       │ 2. POST /h5p/files
       │    Content-Type: multipart/form-data
       │    Authorization: Bearer {JWT_TOKEN}
       │    Body: FormData with file
       ▼
┌────────────────────────────────────────────────────────┐
│  H5P Controller - uploadTemporaryFile()                │
│  - Only TEACHER/ADMIN allowed                          │
│  - Uses Multer middleware for file handling            │
└──────┬─────────────────────────────────────────────────┘
       │
       │ 3. Multer saves file temporarily
       │    Location: uploads/h5p/temp/{random_name}
       ▼
┌────────────────────────────────────────────────────────┐
│  H5P Service - Processing Steps                        │
│                                                        │
│  Step 1: VALIDATE FILE                                │
│  ┌──────────────────────────────────────────┐         │
│  │ - Check file extension (.h5p)            │         │
│  │ - Verify file size (< maxFileSize)       │         │
│  │ - Check MIME type                        │         │
│  └──────────────────────────────────────────┘         │
│                                                        │
│  Step 2: EXTRACT .h5p PACKAGE                         │
│  ┌──────────────────────────────────────────┐         │
│  │ Using zip extraction:                    │         │
│  │ 1. Unzip to temp directory               │         │
│  │ 2. Read h5p.json:                        │         │
│  │    {                                     │         │
│  │      "title": "My Content",              │         │
│  │      "language": "en",                   │         │
│  │      "mainLibrary": "H5P.InteractiveVideo",      │
│  │      "preloadedDependencies": [...]      │         │
│  │    }                                     │         │
│  │ 3. Read content/content.json:            │         │
│  │    {...content parameters}               │         │
│  │ 4. Extract media files                   │         │
│  └──────────────────────────────────────────┘         │
│                                                        │
│  Step 3: VALIDATE CONTENT                             │
│  ┌──────────────────────────────────────────┐         │
│  │ - Check if required libraries exist      │         │
│  │ - Validate content.json structure        │         │
│  │ - Verify library versions compatible     │         │
│  │ - Scan for security issues               │         │
│  └──────────────────────────────────────────┘         │
│                                                        │
│  Step 4: INSTALL LIBRARIES (if needed)                │
│  ┌──────────────────────────────────────────┐         │
│  │ For each library in package:             │         │
│  │ - Check if already in h5p_libraries      │         │
│  │ - If not, install:                       │         │
│  │   INSERT INTO h5p_libraries              │         │
│  │   (name, title, major_version, ...)      │         │
│  │ - Copy library files to:                 │         │
│  │   uploads/h5p/libraries/{library_name}/  │         │
│  └──────────────────────────────────────────┘         │
│                                                        │
│  Step 5: SAVE CONTENT                                 │
│  ┌──────────────────────────────────────────┐         │
│  │ 1. Generate content ID                   │         │
│  │ 2. Create content directory:             │         │
│  │    uploads/h5p/content/{contentId}/      │         │
│  │ 3. Move media files to content dir       │         │
│  │ 4. Insert into database:                 │         │
│  │    INSERT INTO h5p_contents              │         │
│  │    (id, title, library, params,          │         │
│  │     metadata, file_path, uploader_id)    │         │
│  │ 5. Store temporary file reference:       │         │
│  │    INSERT INTO h5p_temporary_files       │         │
│  │    (id, filename, path, uploader_id,     │         │
│  │     expires_at)                          │         │
│  └──────────────────────────────────────────┘         │
│                                                        │
│  Step 6: CLEANUP                                      │
│  ┌──────────────────────────────────────────┐         │
│  │ - Remove extracted temp files            │         │
│  │ - Keep original .h5p for backup          │         │
│  │ - Schedule cleanup of old temp files     │         │
│  └──────────────────────────────────────────┘         │
└────────────────────────────────────────────────────────┘
```

**File System Layout sau khi upload:**

```
uploads/h5p/
├── content/
│   ├── content_123/              # Content ID từ database
│   │   ├── videos/
│   │   │   └── intro.mp4
│   │   ├── images/
│   │   │   ├── thumbnail.jpg
│   │   │   └── slide1.png
│   │   └── audio/
│   │       └── narration.mp3
│   └── content_456/
│       └── ...
│
├── libraries/
│   ├── H5P.InteractiveVideo-1.26/
│   │   ├── library.json          # Library metadata
│   │   ├── scripts/
│   │   │   └── interactive-video.js
│   │   ├── styles/
│   │   │   └── interactive-video.css
│   │   └── language/
│   │       └── en.json
│   ├── H5P.MultiChoice-1.16/
│   │   └── ...
│   └── H5P.Video-1.6/
│       └── ...
│
└── temp/
    ├── upload_abc123.h5p         # Original uploaded file
    ├── upload_def456.h5p
    └── ...
    # Temp files auto-deleted after 24 hours or after processing
```

---

## 5. Luồng Cập Nhật Content (Update Flow)

```
┌─────────────┐
│  Teacher    │
│  Edits      │
│  Content    │
└──────┬──────┘
       │ 1. GET /h5p/content/{id}/edit
       │    Load existing content for editing
       ▼
┌──────────────────────────────────────────────┐
│  H5P Service - getContentForEditing()        │
│  1. Verify user is owner or admin            │
│  2. Load content from database               │
│  3. Return with all params for editing       │
└──────┬───────────────────────────────────────┘
       │
       │ 2. User makes changes in editor
       │    - Modify parameters
       │    - Add/remove media
       │    - Update metadata
       │
       │ 3. PUT /h5p/content/{id}
       │    Body: {
       │      library: "H5P.InteractiveVideo 1.26",
       │      params: {...updated params},
       │      metadata: {...updated metadata}
       │    }
       ▼
┌─────────────────────────────────────────────────────┐
│  H5P Service - updateContent()                      │
│                                                     │
│  Step 1: VERIFY OWNERSHIP                          │
│  ┌───────────────────────────────────────┐         │
│  │ SELECT uploader_id FROM h5p_contents  │         │
│  │ WHERE id = :contentId                 │         │
│  │                                       │         │
│  │ IF uploader_id != userId AND          │         │
│  │    user.role != ADMIN:                │         │
│  │    THROW ForbiddenException           │         │
│  └───────────────────────────────────────┘         │
│                                                     │
│  Step 2: VALIDATE NEW DATA                         │
│  ┌───────────────────────────────────────┐         │
│  │ - Validate library version            │         │
│  │ - Check params structure              │         │
│  │ - Verify metadata                     │         │
│  └───────────────────────────────────────┘         │
│                                                     │
│  Step 3: HANDLE FILE CHANGES                       │
│  ┌───────────────────────────────────────┐         │
│  │ Compare old vs new params:            │         │
│  │ - Identify removed files → delete     │         │
│  │ - Identify new files → move from temp │         │
│  │ - Keep unchanged files                │         │
│  └───────────────────────────────────────┘         │
│                                                     │
│  Step 4: UPDATE DATABASE                           │
│  ┌───────────────────────────────────────┐         │
│  │ UPDATE h5p_contents                   │         │
│  │ SET                                   │         │
│  │   library = :library,                 │         │
│  │   params = :params,                   │         │
│  │   metadata = :metadata,               │         │
│  │   updated_at = NOW()                  │         │
│  │ WHERE id = :contentId                 │         │
│  └───────────────────────────────────────┘         │
│                                                     │
│  Step 5: CLEANUP                                   │
│  ┌───────────────────────────────────────┐         │
│  │ - Remove deleted media files          │         │
│  │ - Clear unused temporary files        │         │
│  └───────────────────────────────────────┘         │
└─────────────────────────────────────────────────────┘
```

---

## 6. Luồng Xóa Content (Delete Flow)

```
┌─────────────┐
│  Teacher    │
│  or Admin   │
└──────┬──────┘
       │ DELETE /h5p/content/{id}
       ▼
┌─────────────────────────────────────────────────────┐
│  H5P Service - deleteContent()                      │
│                                                     │
│  Step 1: VERIFY PERMISSIONS                        │
│  ┌───────────────────────────────────────┐         │
│  │ Check if user is owner or admin       │         │
│  │ If not: THROW ForbiddenException      │         │
│  └───────────────────────────────────────┘         │
│                                                     │
│  Step 2: GET CONTENT DETAILS                       │
│  ┌───────────────────────────────────────┐         │
│  │ SELECT * FROM h5p_contents            │         │
│  │ WHERE id = :contentId                 │         │
│  │                                       │         │
│  │ Get file paths for deletion           │         │
│  └───────────────────────────────────────┘         │
│                                                     │
│  Step 3: DELETE RELATED DATA                       │
│  ┌───────────────────────────────────────┐         │
│  │ -- Delete user interaction data       │         │
│  │ DELETE FROM h5p_user_data             │         │
│  │ WHERE content_id = :contentId         │         │
│  │                                       │         │
│  │ -- Delete tracking events             │         │
│  │ DELETE FROM tracking_events           │         │
│  │ WHERE object_id = :contentId          │         │
│  └───────────────────────────────────────┘         │
│                                                     │
│  Step 4: DELETE CONTENT RECORD                     │
│  ┌───────────────────────────────────────┐         │
│  │ DELETE FROM h5p_contents              │         │
│  │ WHERE id = :contentId                 │         │
│  └───────────────────────────────────────┘         │
│                                                     │
│  Step 5: DELETE FILES                              │
│  ┌───────────────────────────────────────┐         │
│  │ Remove content directory:             │         │
│  │ rm -rf uploads/h5p/content/{contentId}/         │
│  │                                       │         │
│  │ This deletes all:                     │         │
│  │ - Video files                         │         │
│  │ - Image files                         │         │
│  │ - Audio files                         │         │
│  │ - Any other media                     │         │
│  └───────────────────────────────────────┘         │
└─────────────────────────────────────────────────────┘
```

---

## 7. Background Jobs và Maintenance

### Cleanup Job - Xóa Temporary Files Cũ

```typescript
// Scheduled job chạy mỗi ngày
@Cron('0 2 * * *') // Run at 2 AM daily
async cleanupExpiredTemporaryFiles() {
  // 1. Find expired temporary files
  const expiredFiles = await prisma.h5PTemporaryFile.findMany({
    where: {
      expiresAt: {
        lt: new Date(), // Less than current time
      },
    },
  });

  // 2. Delete each file
  for (const file of expiredFiles) {
    try {
      // Delete from file system
      await fs.unlink(file.path);
      
      // Delete from database
      await prisma.h5PTemporaryFile.delete({
        where: { id: file.id },
      });
      
      console.log(`Deleted expired file: ${file.filename}`);
    } catch (error) {
      console.error(`Failed to delete file ${file.filename}:`, error);
    }
  }
}
```

---

## 8. Security và Validation

### Content Validation Pipeline

```typescript
async validateContent(contentData: any) {
  const errors = [];

  // 1. Library Validation
  const library = await this.libraryStorage.getLibrary(
    contentData.library
  );
  
  if (!library) {
    errors.push({
      field: 'library',
      message: `Library ${contentData.library} not found`,
    });
  }

  // 2. Library Version Check
  if (library && !this.isCompatibleVersion(library, contentData.library)) {
    errors.push({
      field: 'library',
      message: 'Incompatible library version',
    });
  }

  // 3. Params Structure Validation
  if (!contentData.params || typeof contentData.params !== 'object') {
    errors.push({
      field: 'params',
      message: 'Invalid params structure',
    });
  }

  // 4. Required Fields Check (based on library semantics)
  const requiredFields = library?.semantics?.filter(s => s.required);
  for (const field of requiredFields || []) {
    if (!contentData.params[field.name]) {
      errors.push({
        field: `params.${field.name}`,
        message: `Required field ${field.name} is missing`,
      });
    }
  }

  // 5. File References Validation
  const fileRefs = this.extractFileReferences(contentData.params);
  for (const fileRef of fileRefs) {
    const fileExists = await this.temporaryStorage.fileExists(fileRef);
    if (!fileExists) {
      errors.push({
        field: 'files',
        message: `Referenced file ${fileRef} not found`,
      });
    }
  }

  // 6. Security Checks
  // - XSS prevention in text fields
  // - SQL injection prevention
  // - Path traversal prevention
  this.sanitizeParams(contentData.params);

  if (errors.length > 0) {
    throw new ValidationException(errors);
  }

  return { valid: true };
}
```

---

## Tóm Tắt Quy Trình Lưu Trữ Dữ Liệu

### Database Tables

1. **h5p_contents** - Lưu content chính
   - Content metadata (title, library, creator)
   - Content parameters (JSON)
   - Content metadata (JSON)
   - Ownership và permissions

2. **h5p_libraries** - Lưu H5P libraries
   - Library information
   - Version tracking
   - Dependencies
   - Assets (JS/CSS references)

3. **h5p_temporary_files** - Quản lý files tạm
   - Uploaded files chờ xử lý
   - Auto-expire after 24 hours
   - Cleanup by cron job

4. **h5p_user_data** (optional) - Lưu user interactions
   - Progress tracking
   - Saved states
   - Answer history

### File System Storage

```
uploads/h5p/
├── content/{contentId}/     # Content-specific media files
├── libraries/{library}/     # Shared H5P library assets
└── temp/                    # Temporary uploads (auto-cleaned)
```

### Data Flow Summary

1. **Create**: Validate → Save DB → Process Files → Return ID
2. **Update**: Verify Owner → Validate → Update DB → Handle Files
3. **Play**: Load DB → Generate Integration → Send to Frontend
4. **Interact**: Save State → Track Events → Update Progress
5. **Delete**: Verify Owner → Delete DB → Remove Files

---

## Performance Optimizations

1. **Caching**:
   - Cache library data (rarely changes)
   - Cache integration configs
   - Use Redis for session data

2. **Lazy Loading**:
   - Load libraries on-demand
   - Stream large media files
   - Paginate content lists

3. **Database Indexing**:
   ```sql
   CREATE INDEX idx_contents_uploader ON h5p_contents(uploader_id);
   CREATE INDEX idx_contents_public ON h5p_contents(is_public);
   CREATE INDEX idx_libraries_name ON h5p_libraries(name, major_version, minor_version);
   ```

4. **File Serving**:
   - Use CDN for static assets
   - Enable HTTP caching headers
   - Compress responses (gzip/brotli)

---

Đây là toàn bộ luồng hoạt động và xử lý dữ liệu H5P trong hệ thống! 🎉
# H5P Integration Documentation

## Overview

This document describes the complete H5P (HTML5 Package) integration implemented in the ebook reader system. H5P allows creation and sharing of rich interactive content such as interactive videos, presentations, games, and more.

## Architecture

### Core Components

1. **H5P Configuration Service** (`h5p-config.service.ts`)
   - Manages H5P system configuration
   - Provides paths, URLs, and feature flags
   - Handles H5P-specific settings

2. **H5P Storage Services**
   - **Content Storage** (`h5p-content-storage.service.ts`): Manages H5P content CRUD operations
   - **Library Storage** (`h5p-library-storage.service.ts`): Handles H5P libraries and dependencies
   - **Temporary Storage** (`h5p-temporary-storage.service.ts`): Manages temporary files during upload/editing

3. **H5P Basic Service** (`h5p-basic.service.ts`)
   - Main orchestrator service
   - Provides simplified H5P operations
   - Handles content validation and processing

4. **H5P Controller** (`h5p.controller.ts`)
   - REST API endpoints for H5P operations
   - Handles authentication and authorization
   - Provides frontend integration points

## Database Schema

The H5P integration uses the following Prisma models:

```prisma
model H5PContent {
  id          String   @id @default(cuid())
  title       String
  library     String   // H5P library used (e.g., "H5P.InteractiveVideo")
  params      Json     // Content parameters and settings
  metadata    Json     // Content metadata
  filePath    String?  // Path to uploaded H5P file
  isPublic    Boolean  @default(false)
  uploaderId  String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  uploader User @relation(fields: [uploaderId], references: [id])

  @@map("h5p_contents")
}

model H5PLibrary {
  id               String @id @default(cuid())
  name             String
  title            String
  majorVersion     Int
  minorVersion     Int
  patchVersion     Int
  runnable         Boolean @default(false)
  restricted       Boolean @default(false)
  fullscreen       Boolean @default(false)
  embedTypes       String
  preloadedJs      String?
  preloadedCss     String?
  dropLibraryCss   String?
  semantics        Json?
  language         Json?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@unique([name, majorVersion, minorVersion, patchVersion])
  @@map("h5p_libraries")
}

model H5PTemporaryFile {
  id        String   @id @default(cuid())
  filename  String
  path      String
  uploaderId String
  createdAt DateTime @default(now())
  expiresAt DateTime

  uploader User @relation(fields: [uploaderId], references: [id])

  @@map("h5p_temporary_files")
}
```

## API Endpoints

### Authentication Required
All H5P endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### Role-Based Access Control

#### Teacher/Admin Only Endpoints
- `POST /h5p/content` - Create new H5P content
- `PUT /h5p/content/:contentId` - Update existing content
- `DELETE /h5p/content/:contentId` - Delete content
- `GET /h5p/content/:contentId/edit` - Get content for editing
- `GET /h5p/editor` - Get editor integration
- `POST /h5p/files` - Upload temporary files
- `DELETE /h5p/files/:fileId` - Delete temporary files
- `GET /h5p/content-types` - Get available content types
- `GET /h5p/libraries` - Get available libraries

#### All Authenticated Users Endpoints
- `GET /h5p/player/:contentId` - Get player integration
- `GET /h5p/content/:contentId` - Get content for playing
- `GET /h5p/content` - List user's contents
- `GET /h5p/files/:fileId` - Access H5P files for playback
- `POST /h5p/ajax/:action` - Process H5P AJAX requests
- `GET /h5p/integration` - Get integration configuration
- `GET /h5p/health` - Health check

### Endpoint Details

#### Content Management

```http
POST /h5p/content
Content-Type: application/json
Authorization: Bearer <token>

{
  "library": "H5P.InteractiveVideo",
  "params": { /* H5P content parameters */ },
  "metadata": { /* Content metadata */ },
  "title": "My Interactive Video"
}
```

```http
GET /h5p/content
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "id": "content_id",
      "title": "Interactive Video",
      "library": "H5P.InteractiveVideo",
      "isPublic": false,
      "createdAt": "2024-01-01T00:00:00Z",
      "uploader": {
        "id": "user_id",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

#### Player Integration

```http
GET /h5p/player/:contentId
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "content": {
      "library": "H5P.InteractiveVideo",
      "params": { /* content parameters */ },
      "metadata": { /* content metadata */ }
    },
    "integration": {
      "url": "/h5p",
      "postUserStatistics": true,
      "ajax": {
        "setFinished": "/h5p/ajax/setFinished",
        "contentUserData": "/h5p/ajax/contentUserData"
      }
    }
  }
}
```

## Frontend Integration

### H5P Player Setup

```typescript
// Import H5P player libraries
import { H5PStandalone } from 'h5p-standalone';

// Initialize H5P player
const h5pPlayer = new H5PStandalone();

// Load and display content
async function loadH5PContent(contentId: string) {
  try {
    const response = await fetch(`/api/h5p/player/${contentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const { data } = await response.json();
    
    // Initialize H5P player with content
    await h5pPlayer.init({
      h5pJsonPath: data.content,
      frameJs: '/h5p/frame.js',
      frameCss: '/h5p/frame.css',
      librariesPath: '/h5p/libraries',
      contentPath: '/h5p/content'
    });
  } catch (error) {
    console.error('Failed to load H5P content:', error);
  }
}
```

### H5P Editor Setup

```typescript
// Import H5P editor libraries
import { H5PEditor } from 'h5p-editor';

// Initialize H5P editor
const h5pEditor = new H5PEditor();

// Setup content creation
async function setupH5PEditor() {
  try {
    const response = await fetch('/api/h5p/editor', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const { data } = await response.json();
    
    // Initialize editor with configuration
    await h5pEditor.init({
      baseUrl: '/h5p',
      ajaxPath: '/api/h5p/ajax/',
      libraryUrl: '/h5p/libraries/',
      filesPath: '/h5p/files/',
      language: 'en'
    });
  } catch (error) {
    console.error('Failed to setup H5P editor:', error);
  }
}
```

## File Storage

### Directory Structure

```
uploads/h5p/
├── content/          # H5P content files
│   └── {contentId}/
├── libraries/        # H5P libraries
│   └── {libraryName}/
└── temp/            # Temporary files during upload
    └── {fileId}
```

### File Upload Process

1. Teacher uploads .h5p file to `/h5p/files`
2. System extracts and validates content
3. Files stored in temporary location
4. Content created via `/h5p/content` endpoint
5. Files moved to permanent content location
6. Temporary files cleaned up

## Security Features

### Authentication & Authorization
- JWT-based authentication required for all endpoints
- Role-based access control (STUDENT/TEACHER/ADMIN)
- Content ownership verification
- File access validation

### Content Security
- H5P file validation and sanitization
- Library dependency checking
- Content parameter validation
- XSS protection in user-generated content

### File Security
- Uploaded file type validation
- File size limits enforcement
- Temporary file expiration
- Path traversal protection

## Development

### Setup Requirements

1. **Dependencies**
   ```bash
   npm install @lumieducation/h5p-server
   npm install @lumieducation/h5p-webcomponents
   ```

2. **Environment Variables**
   ```env
   H5P_BASE_URL=http://localhost:3000
   H5P_LIBRARIES_PATH=./uploads/h5p/libraries
   H5P_CONTENT_PATH=./uploads/h5p/content
   H5P_TEMP_PATH=./uploads/h5p/temp
   ```

3. **Database Migration**
   ```bash
   npx prisma migrate dev --name add-h5p-models
   ```

### Testing

Run the H5P integration tests:

```bash
node test-h5p.js
```

### Debugging

Enable H5P debug mode:

```typescript
// In h5p-config.service.ts
debug: {
  enabled: true,
  level: 'info'
}
```

## Troubleshooting

### Common Issues

1. **H5P Libraries Not Loading**
   - Check library directory permissions
   - Verify library file structure
   - Ensure proper H5P library versions

2. **Content Not Displaying**
   - Validate content parameters
   - Check browser console for errors
   - Verify file paths and URLs

3. **Upload Failures**
   - Check file size limits
   - Verify .h5p file structure
   - Ensure temporary directory is writable

### Log Analysis

Check application logs for H5P-related errors:

```bash
# Check for H5P errors
grep "H5P" logs/application.log

# Check for upload errors
grep "upload" logs/application.log
```

## Future Enhancements

1. **Content Analytics**
   - User interaction tracking
   - Completion statistics
   - Performance analytics

2. **Advanced Features**
   - Content templates
   - Bulk operations
   - Version history

3. **Integration Improvements**
   - Real-time collaboration
   - Advanced permissions
   - Content sharing between users

## Support

For issues related to H5P integration:
1. Check this documentation
2. Review server logs
3. Verify database schema
4. Test with provided test script
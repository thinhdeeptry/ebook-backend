-- CreateTable
CREATE TABLE "h5p_libraries" (
    "id" TEXT NOT NULL,
    "machineName" TEXT NOT NULL,
    "majorVersion" INTEGER NOT NULL,
    "minorVersion" INTEGER NOT NULL,
    "patchVersion" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "author" TEXT,
    "license" TEXT,
    "libraryJson" JSONB NOT NULL,
    "semanticsJson" JSONB,
    "languageJson" JSONB,
    "files" JSONB,
    "dependencies" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "uploaderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "h5p_libraries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "h5p_content_libraries" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "libraryId" TEXT NOT NULL,
    "dependencyType" TEXT NOT NULL,

    CONSTRAINT "h5p_content_libraries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "h5p_temporary_files" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "size" BIGINT NOT NULL,
    "mimetype" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "h5p_temporary_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "h5p_libraries_machineName_majorVersion_minorVersion_patchVe_key" ON "h5p_libraries"("machineName", "majorVersion", "minorVersion", "patchVersion");

-- CreateIndex
CREATE UNIQUE INDEX "h5p_content_libraries_contentId_libraryId_dependencyType_key" ON "h5p_content_libraries"("contentId", "libraryId", "dependencyType");

-- AddForeignKey
ALTER TABLE "h5p_libraries" ADD CONSTRAINT "h5p_libraries_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "h5p_temporary_files" ADD CONSTRAINT "h5p_temporary_files_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

# Dockerfile for NestJS E-Learning Backend
# Multi-stage build for optimized production image

# Stage 1: Base stage with Node.js and pnpm
FROM node:18-alpine AS base
RUN npm install -g pnpm
WORKDIR /app

# Stage 2: Dependencies installation
FROM base AS dependencies
# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma/

# Install all dependencies (including dev dependencies for build)
RUN pnpm install --frozen-lockfile

# Generate Prisma client
RUN pnpm prisma generate

# Stage 3: Build the application
FROM dependencies AS build
# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Stage 4: Production dependencies only
FROM base AS production-deps
# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma/

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Generate Prisma client for production
RUN pnpm prisma generate

# Stage 5: Final production image
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Set working directory
WORKDIR /app

# Copy production dependencies
COPY --from=production-deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=production-deps --chown=nestjs:nodejs /app/prisma ./prisma

# Copy built application
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/package.json ./package.json

# Create uploads directory
RUN mkdir -p uploads/epub uploads/h5p/content uploads/h5p/libraries uploads/h5p/temp uploads/h5p/work
RUN chown -R nestjs:nodejs uploads

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application with dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
# syntax=docker/dockerfile:1.9
# Development stage
FROM node:22-alpine AS development
WORKDIR /app

# Copy package files only for better caching
COPY package*.json ./

# Use BuildKit cache mount for npm cache
#RUN --mount=type=cache,target=/root/.npm npm ci
RUN npm ci --no-audit --fund=false

# Build stage
FROM node:22-alpine AS build
WORKDIR /app

# Copy dependencies from previous stage
COPY --from=development /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production dependencies stage
FROM node:22-alpine AS prod-deps
WORKDIR /app

# Copy package files and all node_modules
COPY package*.json ./
COPY --from=build /app/node_modules ./node_modules

# Prune development dependencies
RUN npm prune --omit=dev && \
    npm cache clean --force

# Production stage
FROM node:22-alpine AS production

# Set production environment
ENV NODE_ENV=production

# Install tini for proper signal handling
RUN apk add --no-cache tini

WORKDIR /app

# Copy production dependencies
COPY --from=prod-deps /app/node_modules ./node_modules

# Copy built application
COPY --from=build /app/dist ./dist

# Copy package files
COPY package*.json ./

# Create non-root user with consistent GID/UID
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs && \
    chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose application port
EXPOSE 3003

# Use tini as entrypoint for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start the application
CMD ["node", "dist/main"]
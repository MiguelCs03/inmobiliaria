# syntax=docker/dockerfile:1.9
FROM node:22-alpine AS development
WORKDIR /app

COPY package*.json ./
RUN npm ci --no-audit --fund=false

FROM node:22-alpine AS build
WORKDIR /app

COPY --from=development /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS prod-deps
WORKDIR /app

COPY package*.json ./
COPY --from=build /app/node_modules ./node_modules
RUN npm prune --omit=dev && npm cache clean --force

FROM node:22-alpine AS production
ENV NODE_ENV=production
RUN apk add --no-cache tini
WORKDIR /app

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package*.json ./

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs && \
    chown -R nestjs:nodejs /app

USER nestjs
EXPOSE 3000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main"]

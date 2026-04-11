# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/

RUN npm install --workspace=packages/backend

# Copy source
COPY packages/backend ./packages/backend

RUN npm run build --workspace=packages/backend

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/

RUN npm install --production --workspace=packages/backend

# Copy built files
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist

WORKDIR /app/packages/backend

EXPOSE 3333

CMD ["node", "dist/main.js"]

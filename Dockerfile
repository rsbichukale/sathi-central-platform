# 1. Build Stage for Frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app/web-ui
COPY web-ui/package*.json ./
ENV NODE_ENV=development
RUN npm install
COPY web-ui/ ./
RUN npm run build

# 2. Production Runtime Stage
FROM node:22-alpine
WORKDIR /app

# Setup directories
RUN mkdir -p /app/data && \
    mkdir -p /app/web-ui/dist

# Install backend dependencies
COPY package*.json ./
RUN npm install --production

# Copy backend source code
COPY src/ ./src/

# Copy built frontend assets from builder stage
COPY --from=frontend-builder /app/web-ui/dist/ ./web-ui/dist/

# Expose backend port
EXPOSE 9090

# Set production environment variable
ENV NODE_ENV=production

# Start Node.js server
CMD ["node", "src/app.js"]

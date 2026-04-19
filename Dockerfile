# Stage 1: Build
FROM oven/bun:latest AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./
RUN bun install

# Copy source code
COPY . .

# Pass build arguments
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN bun run build

# Stage 2: Serve
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config if needed (optional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

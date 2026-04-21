# Gunakan image resmi Bun
FROM docker.io/oven/bun:latest

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Install dependencies project
RUN bun install

# Build project
RUN bun run build

# Expose port (default vite preview adalah 4173)
EXPOSE 4173

# Jalankan aplikasi menggunakan preview mode
CMD ["bun", "run", "preview", "--host"]

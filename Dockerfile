FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy application source
COPY server/ ./server/
COPY public/ ./public/

# Create credentials directory
RUN mkdir -p ./credentials

# Create startup script that writes GA credentials from env var
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'if [ -n "$GA_CREDENTIALS_JSON" ]; then' >> /app/start.sh && \
    echo '  printf "%s" "$GA_CREDENTIALS_JSON" > ./credentials/ga-credentials.json' >> /app/start.sh && \
    echo '  echo "✅ GA credentials written from environment"' >> /app/start.sh && \
    echo 'fi' >> /app/start.sh && \
    echo 'node server/index.js' >> /app/start.sh && \
    chmod +x /app/start.sh

EXPOSE 3000

ENV NODE_ENV=production

# Run as non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup && \
    chown -R appuser:appgroup /app

USER appuser

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["/app/start.sh"]

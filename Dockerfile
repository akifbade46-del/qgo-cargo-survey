# ─── Stage 1: Build React + Vite frontend ──────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps first (cached layer)
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source
COPY . .

# Build args for Vite (baked at build time)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

RUN npm run build

# ─── Stage 2: Serve with Nginx ──────────────────────────────────────────────
FROM nginx:alpine

RUN apk add --no-cache curl

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s \
  CMD curl -f http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

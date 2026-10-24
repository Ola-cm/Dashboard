FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json package-lock.json* ./
COPY backend/package.json ./backend/
COPY backend/prisma ./backend/prisma
ENV HUSKY=0
RUN npm ci --workspace=backend --include-workspace-root

COPY backend ./backend

WORKDIR /app/backend

EXPOSE 8080

CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]

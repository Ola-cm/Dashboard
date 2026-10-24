FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
COPY frontend/package.json ./frontend/
ENV HUSKY=0
RUN npm ci --workspace=frontend --include-workspace-root

COPY frontend ./frontend

WORKDIR /app/frontend
ENV VITE_BACKEND_URL=http://backend:8080

EXPOSE 5173

CMD ["npm", "run", "dev"]

# --- ビルドステージ ---
FROM node:20-alpine AS builder

WORKDIR /app

# 依存パッケージを先にインストール（キャッシュ活用）
COPY package*.json ./
RUN npm ci

# ソースコードをコピーしてビルド
COPY . .
RUN npm run build

# --- 本番ステージ ---
FROM nginx:alpine

# ビルド成果物をnginxに配置
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA対応のnginx設定
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

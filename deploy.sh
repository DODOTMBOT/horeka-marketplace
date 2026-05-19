#!/usr/bin/env bash
set -e

SERVER="root@72.56.249.243"
SSH_PORT="2222"
APP_DIR="/var/www/horeka"

echo "==> Синхронизация файлов..."
rsync -avz --exclude='.next' --exclude='node_modules' --exclude='.env' --exclude='.env.local' \
  -e "ssh -p ${SSH_PORT} -o StrictHostKeyChecking=no" \
  ./ ${SERVER}:${APP_DIR}/

echo "==> Зависимости + миграция + сборка..."
ssh -p ${SSH_PORT} -o StrictHostKeyChecking=no ${SERVER} "
  cd ${APP_DIR}
  npm install --legacy-peer-deps
  npx prisma db push
  npx prisma generate
  npm run build
  pm2 restart horeka && pm2 save
  echo '✅ Деплой завершён'
"

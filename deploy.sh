#!/bin/bash
set -e

echo "🔄 Pulling latest code from GitHub..."
cd ~/projects/BlogMernStack
git pull origin main

echo "📦 Installing backend dependencies..."
cd backend
npm install --production

echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo "🏗️ Building frontend for production..."
npm run build

echo "🚀 Deploying frontend..."
sudo cp -r dist/* /var/www/trongvt.tech/
sudo chown -R www-data:www-data /var/www/trongvt.tech

echo "🔄 Restarting backend..."
pm2 restart blog-backend

echo "✅ Deploy completed!"
echo "🌐 Website: https://trongvt.tech"

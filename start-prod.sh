#!/bin/bash

set -e

echo "======================================================="
echo "        INICIANDO DESPLIEGUE EN PRODUCCIÓN (EC2)       "
echo "======================================================="

if ! command -v pnpm &> /dev/null; then
  echo "pnpm no encontrado. Instalando pnpm globalmente..."
  sudo npm install -g pnpm
fi

if ! command -v pm2 &> /dev/null; then
  echo "PM2 no encontrado. Instalando PM2 globalmente..."
  sudo npm install -g pm2
fi

echo "Revisando archivos .env..."

if [ ! -f backend/.env ]; then
  echo "❌ ERROR: No se encontró 'backend/.env'. Crea el archivo con tus credenciales de RDS antes de continuar."
  exit 1
fi

echo "Instalando dependencias del Backend..."
(cd backend && pnpm install)

echo "Instalando dependencias del Frontend..."
(cd frontend && pnpm install)

echo "Compilando Frontend (Vite)..."
(cd frontend && pnpm run build)

echo "Compilando Backend (NestJS)..."
(cd backend && pnpm run build)

echo "Gestionando procesos con PM2..."

if pm2 describe nest-backend > /dev/null 2>&1; then
  echo "Reiniciando Backend..."
  pm2 restart nest-backend
else
  echo "Iniciando Backend..."
  pm2 start backend/dist/main.js --name "nest-backend"
fi

pm2 save

echo ""
echo "======================================================="
echo "   🎉 ¡DESPLIEGUE COMPLETADO Y CORRIENDO EN SEGUNDO PLANO! 🎉"
echo "======================================================="
echo ""
pm2 status
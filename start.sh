#!/bin/bash

echo "revisando variables y dependencias..."

if [ ! -f backend/.env ] && [ -f backend/.env.example ]; then
  echo "Copiando el .env desde el .env.example"
  cp backend/.env.example backend/.env
fi

if [ ! -f frontend/.env ] && [ -f frontend/.env.example ]; then
  echo "COpiando el .env desde el .env.example"
  cp frontend/.env.example frontend/.env
fi

if [ ! -d "backend/node_modules" ]; then
  echo "no hay node modules, instalando..."
  (cd backend && pnpm install)
fi

if [ ! -d "frontend/node_modules" ]; then
  echo "no hay node_modules, instalando..."
  (cd frontend && pnpm install)
fi

echo "levantando postgres y pgadmin..."
docker compose -f docker/docker-compose.yml up -d

echo "esperando a que postgres este listo..."
until docker exec postgres_db pg_isready -U app -d checkout > /dev/null 2>&1; do
  sleep 1
done

echo "postgres listo"

RUTA_PROYECTO="$(pwd)"

echo "abriendo sub terminales..."

env -u LD_LIBRARY_PATH -u LD_PRELOAD gnome-terminal --tab --title="NestJS (Backend)" -- bash -c "cd '$RUTA_PROYECTO/backend' && pnpm run start:dev; exec bash"
env -u LD_LIBRARY_PATH -u LD_PRELOAD gnome-terminal --tab --title="Vite (Frontend)" -- bash -c "cd '$RUTA_PROYECTO/frontend' && pnpm run dev; exec bash"

echo "Todo listo señor :)"

cleanup() {
  echo ""
  echo "apagando nestjs, vite y docker..."
  
  fuser -k 3000/tcp > /dev/null 2>&1 || true
  fuser -k 5173/tcp > /dev/null 2>&1 || true
  
  docker compose -f docker/docker-compose.yml down
  
  echo "todo limpio y apagado, nos vemos"
  exit 0
}

trap cleanup INT TERM

echo ""
echo "======================================================="
echo " TODO CORRIENDO. PRESIONA [ENTER] O CTRL+C PARA APAGAR TODO"
echo "======================================================="

read -r
cleanup
#!/usr/bin/env bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Install frontend dependencies if needed
if [ ! -d "$PROJECT_DIR/frontend/node_modules" ]; then
  echo "Installing frontend dependencies..."
  cd "$PROJECT_DIR/frontend" && npm install
fi

# Start backend
echo "Starting backend on port 5000..."
cd "$PROJECT_DIR/backend"
PYTHONPATH="$PROJECT_DIR/backend" python app.py &
BACKEND_PID=$!

# Start frontend
echo "Starting frontend on port 3000..."
cd "$PROJECT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait

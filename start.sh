#!/usr/bin/env bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Prefer the project virtual environment when available.
VENV_PYTHON="$PROJECT_DIR/.venv/bin/python"
if [ -x "$VENV_PYTHON" ]; then
  PYTHON_BIN="$VENV_PYTHON"
else
  PYTHON_BIN="$(command -v python3 || command -v python || true)"
fi

if [ -z "$PYTHON_BIN" ]; then
  echo "Python not found. Install Python 3 or create .venv in $PROJECT_DIR"
  exit 1
fi

echo "Using Python interpreter: $PYTHON_BIN"

# Check if models need retraining (if dataset is newer than checkpoint)
# We check both files and directories to detect deletions (which update dir mtime)
# Use %Ts for integer seconds to avoid needing 'bc' for float comparison
LATEST_DATA_CHANGE=$(find "$PROJECT_DIR/resources/dataset/training_images" \( -type f -o -type d \) -printf '%Ts\n' 2>/dev/null | sort -n | tail -1)
[ -z "$LATEST_DATA_CHANGE" ] && LATEST_DATA_CHANGE=0
MODEL_A_TIMESTAMP=$(stat -c %Y "$PROJECT_DIR/runs/model_a/best.pt" 2>/dev/null || echo 0)
MODEL_B_TIMESTAMP=$(stat -c %Y "$PROJECT_DIR/runs/model_b/best.pt" 2>/dev/null || echo 0)

# If data is newer than Model A, delete checkpoint to force retrain
if [[ "$LATEST_DATA_CHANGE" -gt "$MODEL_A_TIMESTAMP" ]]; then
  echo "Dataset has changed. Deleting Model A checkpoint to force retraining..."
  rm -f "$PROJECT_DIR/runs/model_a/best.pt"
fi

# If data is newer than Model B, delete checkpoint to force retrain
if [[ "$LATEST_DATA_CHANGE" -gt "$MODEL_B_TIMESTAMP" ]]; then
  echo "Dataset has changed. Deleting Model B checkpoint to force retraining..."
  rm -f "$PROJECT_DIR/runs/model_b/best.pt"
fi

# Train models if checkpoints don't exist (or were deleted above)
if [ ! -f "$PROJECT_DIR/runs/model_a/best.pt" ] || [ ! -f "$PROJECT_DIR/runs/model_b/best.pt" ]; then
  echo "Checkpoints not found. Preparing datasets and training models..."

  # Prepare datasets
  cd "$PROJECT_DIR/backend"
  PYTHONPATH="$PROJECT_DIR/backend" "$PYTHON_BIN" scripts/prepare_datasets.py

  # Train Model A (specialist, clean only)
  if [ ! -f "$PROJECT_DIR/runs/model_a/best.pt" ]; then
    echo "Training Model A (specialist)..."
    PYTHONPATH="$PROJECT_DIR/backend" "$PYTHON_BIN" image_classifier/train.py \
      --data_dir "$PROJECT_DIR/resources/dataset/model_a_data" \
      --out_dir "$PROJECT_DIR/runs/model_a" \
      --epochs 10 --batch_size 16 --lr 0.001
  fi

  # Train Model B (robust, clean + mixed)
  if [ ! -f "$PROJECT_DIR/runs/model_b/best.pt" ]; then
    echo "Training Model B (robust)..."
    PYTHONPATH="$PROJECT_DIR/backend" "$PYTHON_BIN" image_classifier/train.py \
      --data_dir "$PROJECT_DIR/resources/dataset/model_b_data" \
      --out_dir "$PROJECT_DIR/runs/model_b" \
      --epochs 10 --batch_size 16 --lr 0.001
  fi

  echo "Training complete."
fi

# Install frontend dependencies if needed
if [ ! -d "$PROJECT_DIR/frontend/node_modules" ]; then
  echo "Installing frontend dependencies..."
  cd "$PROJECT_DIR/frontend" && npm install
fi

# Start backend
echo "Starting backend on port 5000..."
cd "$PROJECT_DIR/backend"
PYTHONPATH="$PROJECT_DIR/backend" "$PYTHON_BIN" app.py &
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

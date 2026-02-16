#!/bin/bash
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== DEBUGGING TIMESTAMPS ==="
echo "Checking directory: $PROJECT_DIR/resources/dataset/training_images"

# Check find output
echo "Top 5 newest items:"
find "$PROJECT_DIR/resources/dataset/training_images" \( -type f -o -type d \) -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -5

LATEST_DATA_CHANGE=$(find "$PROJECT_DIR/resources/dataset/training_images" \( -type f -o -type d \) -printf '%T@\n' 2>/dev/null | sort -n | tail -1)
[ -z "$LATEST_DATA_CHANGE" ] && LATEST_DATA_CHANGE=0
echo "LATEST_DATA_CHANGE: $LATEST_DATA_CHANGE"

MODEL_A_TIMESTAMP=$(stat -c %Y "$PROJECT_DIR/runs/model_a/best.pt" 2>/dev/null || echo 0)
echo "MODEL_A_TIMESTAMP:  $MODEL_A_TIMESTAMP"

echo "Comparison logic:"
if (( $(echo "$LATEST_DATA_CHANGE > $MODEL_A_TIMESTAMP" | bc -l) )); then
  echo "Result: RE-TRAIN (Data is newer)"
else
  echo "Result: NO CHANGE (Data is older or same)"
fi

echo "============================"

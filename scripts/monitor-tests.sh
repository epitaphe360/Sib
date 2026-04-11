#!/bin/bash
LOG_FILE="/tmp/playwright-full.log"

while true; do
  TOTAL=$(grep -c "✓\|✘\|×" "$LOG_FILE" 2>/dev/null || echo "0")
  PASSED=$(grep -c "✓" "$LOG_FILE" 2>/dev/null || echo "0")
  FAILED=$(grep -c "✘\|×" "$LOG_FILE" 2>/dev/null || echo "0")
  
  echo "[$(date '+%H:%M:%S')] Total: $TOTAL/935 | Passed: $PASSED | Failed: $FAILED"
  
  # Check if playwright is still running
  if ! pgrep -f "playwright" > /dev/null; then
    echo "Tests finished!"
    break
  fi
  
  sleep 60
done

#!/usr/bin/env bash
set -euo pipefail

# Usage: tmux-dev.sh [next|stripe|all|stop]
# Launches dev servers in a tmux session called "dev".
# Handles: running inside/outside tmux, existing sessions, stale windows.

SESSION="dev"
MODE="${1:-all}"
DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Check if a window exists and still has a live process.
window_alive() {
  local win="$1"
  tmux list-windows -t "$SESSION" -F '#{window_name}' 2>/dev/null | grep -qx "$win" &&
    tmux list-panes -t "$SESSION:$win" -F '#{pane_dead}' 2>/dev/null | grep -qx '0'
}

# Start a command in a tmux window. Skips if the window is already running.
# Replaces the window only if the process has exited.
# Args: $1=window-name  $2=command
start_window() {
  local win="$1" cmd="$2"

  if tmux has-session -t "$SESSION" 2>/dev/null; then
    if window_alive "$win"; then
      echo "  '$win' already running — skipping"
      return
    fi
    # Kill dead window if it's still lingering
    if tmux list-windows -t "$SESSION" -F '#{window_name}' | grep -qx "$win"; then
      tmux kill-window -t "$SESSION:$win"
    fi
    tmux new-window -t "$SESSION" -n "$win" -c "$DIR" "$cmd"
  else
    # Create session with this as the first window
    tmux new-session -d -s "$SESSION" -n "$win" -c "$DIR" "$cmd"
  fi
}

attach_session() {
  if [ -n "${TMUX:-}" ]; then
    # Already inside tmux — switch to the session
    tmux switch-client -t "$SESSION"
  else
    tmux attach-session -t "$SESSION"
  fi
}

case "$MODE" in
  next)
    start_window "next" "bun run next dev --webpack"
    ;;
  stripe)
    start_window "stripe" "bun run stripe:listen"
    ;;
  all)
    start_window "stripe" "bun run stripe:listen"
    start_window "next" "bun run next dev --webpack"
    ;;
  stop)
    if tmux has-session -t "$SESSION" 2>/dev/null; then
      tmux kill-session -t "$SESSION"
      echo "Killed tmux session '$SESSION'"
    else
      echo "No '$SESSION' session running"
    fi
    exit 0
    ;;
  *)
    echo "Usage: tmux-dev.sh [next|stripe|all|stop]"
    exit 1
    ;;
esac

echo "Dev servers running in tmux session '$SESSION'"
echo "  Attach: tmux attach -t $SESSION"
attach_session

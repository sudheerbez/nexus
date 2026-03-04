#!/bin/bash
# Enable centralized cache for any unavoidable python caches
export PYTHONPYCACHEPREFIX=~/.cache/pycache
# Completely prevent bytecode generation
export PYTHONDONTWRITEBYTECODE=1

echo "Starting backend with __pycache__ completely disabled..."
source .venv/bin/activate
uvicorn app.main:app --reload

#!/bin/bash

# Simple HTTP server for the Activity Tracker app
echo "Starting Activity Tracker..."
echo "Open your browser to: http://localhost:8000/public/index.html"
echo "Press Ctrl+C to stop the server"
echo ""

# Start Python HTTP server
cd "$(dirname "$0")"
python3 -m http.server 8000

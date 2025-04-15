#!/bin/bash
# Development script for running ToolChest with development settings

echo "🔧 Starting ToolChest in DEVELOPMENT MODE"
echo "🚫 Caching is disabled for easier development"

# Set environment variables
PORT=8080
TOOLCHEST_DEV_MODE=true

# Run the application
./gradlew run -t -Dio.ktor.development=true
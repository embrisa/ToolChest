#!/bin/bash
# Development script for running ToolChest with development settings

echo "🔧 Starting ToolChest in DEVELOPMENT MODE"
echo "🚫 Caching is disabled for easier development"

# Set development mode environment variable and run the application
TOOLCHEST_DEV_MODE=true ./gradlew run -t -Dio.ktor.development=true
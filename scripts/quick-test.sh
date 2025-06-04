#!/bin/bash

# Quick Test Script for tool-chest
# Runs the fastest test suite for rapid iteration

echo "⚡ Running Quick Tests for tool-chest..."
echo "======================================"

# Set up test database automatically
echo "🗄️ Setting up test database..."
npm run test:setup

# Run the quick test suite (unit tests only)
echo ""
echo "🧪 Running unit tests..."
npm run test:quick

echo ""
echo "✅ Quick test run completed!"
echo "📝 For full test suite including E2E tests, run: npm test" 
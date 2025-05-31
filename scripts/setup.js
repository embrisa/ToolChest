#!/usr/bin/env node

/**
 * Setup Script for Next.js ToolChest
 *
 * This script helps set up the development environment by:
 * 1. Copying environment template files
 * 2. Installing dependencies
 * 3. Setting up the database
 * 4. Validating the configuration
 * 5. Running initial health checks
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Color codes for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = colors.white) {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step, description) {
  log(
    `\n${colors.bold}${colors.blue}Step ${step}:${colors.reset} ${description}`,
  );
}

function logSuccess(message) {
  log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logWarning(message) {
  log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function logError(message) {
  log(`${colors.red}❌ ${message}${colors.reset}`);
}

function logInfo(message) {
  log(`${colors.cyan}ℹ️  ${message}${colors.reset}`);
}

function runCommand(command, description) {
  try {
    log(`   Running: ${command}`);
    execSync(command, { stdio: 'inherit' });
    logSuccess(`${description} completed`);
    return true;
  } catch (error) {
    logError(`${description} failed: ${error.message}`);
    return false;
  }
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function copyFile(source, destination) {
  try {
    fs.copyFileSync(source, destination);
    logSuccess(`Copied ${source} to ${destination}`);
    return true;
  } catch (error) {
    logError(`Failed to copy ${source} to ${destination}: ${error.message}`);
    return false;
  }
}

async function main() {
  log(
    `${colors.bold}${colors.magenta}🚀 Next.js ToolChest Setup Script${colors.reset}\n`,
  );

  // Step 1: Check if we're in the right directory
  logStep(1, 'Verifying setup location');

  if (!fileExists('package.json')) {
    logError(
      'package.json not found. Please run this script from the Next.js project root.',
    );
    process.exit(1);
  }

  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (packageJson.name !== 'nextjs') {
    logError("This doesn't appear to be the Next.js ToolChest project.");
    process.exit(1);
  }

  logSuccess('Project location verified');

  // Step 2: Set up environment files
  logStep(2, 'Setting up environment configuration');

  if (!fileExists('.env.local')) {
    if (fileExists('env.example')) {
      copyFile('env.example', '.env.local');
      logWarning(
        'Please update .env.local with your actual database URL and other configurations',
      );
    } else {
      logError('env.example not found. Cannot create .env.local');
      process.exit(1);
    }
  } else {
    logInfo('.env.local already exists, skipping copy');
  }

  // Step 3: Install dependencies
  logStep(3, 'Installing dependencies');

  if (!runCommand('npm install', 'Dependency installation')) {
    logError(
      'Failed to install dependencies. Please check your npm configuration.',
    );
    process.exit(1);
  }

  // Step 4: Generate Prisma client
  logStep(4, 'Setting up database client');

  if (!runCommand('npm run db:generate', 'Prisma client generation')) {
    logError(
      'Failed to generate Prisma client. Please check your database configuration.',
    );
    process.exit(1);
  }

  // Step 5: Validate environment configuration
  logStep(5, 'Validating environment configuration');

  try {
    execSync('npm run env:validate', { stdio: 'pipe' });
    logSuccess('Environment configuration is valid');
  } catch (error) {
    logError('Environment validation failed');
    logInfo(
      'Please check your .env.local file and ensure all required variables are set',
    );
    logInfo('Refer to env.example for the complete list of required variables');

    // Show the specific error
    const errorOutput = error.stdout ? error.stdout.toString() : error.message;
    log(`\n${colors.red}Error details:${colors.reset}`);
    log(errorOutput);

    logInfo('\n📝 To fix this:');
    logInfo('1. Open .env.local in your editor');
    logInfo(
      '2. Update the DATABASE_URL with your PostgreSQL connection string',
    );
    logInfo('3. Set any other required environment variables');
    logInfo('4. Run "npm run env:validate" to check your configuration');

    process.exit(1);
  }

  // Step 6: Test build process
  logStep(6, 'Testing build process');

  if (!runCommand('npm run type-check', 'TypeScript type checking')) {
    logError('TypeScript type checking failed. Please fix type errors.');
    process.exit(1);
  }

  // Step 7: Run linting
  logStep(7, 'Running code quality checks');

  if (!runCommand('npm run lint', 'ESLint checking')) {
    logWarning(
      'Linting issues found. You may want to run "npm run lint:fix" to auto-fix some issues.',
    );
  }

  // Step 8: Final health check (optional, only if server is running)
  logStep(8, 'Final validation');

  log(`\n${colors.bold}${colors.green}🎉 Setup Complete!${colors.reset}\n`);

  logInfo('Next steps:');
  logInfo('1. Update your .env.local file with the correct DATABASE_URL');
  logInfo('2. Start the development server: npm run dev');
  logInfo(
    '3. Visit http://localhost:3000/api/health to verify everything is working',
  );
  logInfo('4. Start developing your Next.js ToolChest application!');

  log(`\n${colors.bold}Useful commands:${colors.reset}`);
  log(
    `${colors.cyan}npm run dev${colors.reset}           - Start development server`,
  );
  log(
    `${colors.cyan}npm run build${colors.reset}         - Build for production`,
  );
  log(
    `${colors.cyan}npm run lint${colors.reset}          - Check code quality`,
  );
  log(
    `${colors.cyan}npm run type-check${colors.reset}    - Check TypeScript types`,
  );
  log(`${colors.cyan}npm run test${colors.reset}          - Run tests`);
  log(
    `${colors.cyan}npm run db:studio${colors.reset}     - Open Prisma Studio`,
  );
  log(
    `${colors.cyan}npm run health${colors.reset}        - Check application health`,
  );
  log(
    `${colors.cyan}npm run validate${colors.reset}      - Run all validation checks`,
  );
}

// Run the setup script
main().catch((error) => {
  logError(`Setup failed: ${error.message}`);
  process.exit(1);
});

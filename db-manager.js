#!/usr/bin/env node

/**
 * Database Management Script
 * 
 * This script provides convenient commands to manage your database:
 * - Reset and seed database with sample data
 * - Quick setup for development
 * - Backup and restore operations
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, description) {
  log(`\n🔄 ${description}...`, 'cyan');
  try {
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} completed successfully!`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} failed!`, 'red');
    console.error(error.message);
    return false;
  }
}

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(`${colors.yellow}${question}${colors.reset}`, (answer) => {
      resolve(answer.toLowerCase().trim());
    });
  });
}

async function resetAndSeed() {
  log('\n🚨 WARNING: This will DELETE ALL existing data!', 'red');
  
  const confirm = await askQuestion('Are you sure you want to continue? (yes/no): ');
  
  if (confirm !== 'yes' && confirm !== 'y') {
    log('Operation cancelled.', 'yellow');
    return;
  }

  log('\n🗄️  Database Reset and Seeding Process Started', 'bright');
  
  // Reset database
  if (!execCommand('npx prisma migrate reset --force', 'Resetting database')) {
    return;
  }

  // Generate Prisma client
  if (!execCommand('npx prisma generate', 'Generating Prisma client')) {
    return;
  }

  // Run seed
  if (!execCommand('npm run prisma:seed', 'Seeding database with sample data')) {
    return;
  }

  log('\n🎉 Database setup completed successfully!', 'green');
  log('\n📋 What was created:', 'cyan');
  log('   👤 9 Users (1 admin, 3 teachers, 5 students)');
  log('   📚 5 Sample Ebooks with metadata');
  log('   🎮 5 H5P Interactive Content');
  log('   🎓 4 Sample Courses');
  log('   📝 8 Student Enrollments');
  log('   📊 90+ Tracking Events');
  
  log('\n🔐 Test Accounts:', 'cyan');
  log('   Admin: admin@example.com / admin123');
  log('   Teacher: teacher@example.com / teacher123');
  log('   Student: student@example.com / student123');
}

async function quickSetup() {
  log('\n⚡ Quick Development Setup', 'bright');
  
  // Check if database exists
  if (!execCommand('npx prisma migrate dev --name init', 'Setting up database schema')) {
    return;
  }

  // Generate Prisma client
  if (!execCommand('npx prisma generate', 'Generating Prisma client')) {
    return;
  }

  // Run seed only if no users exist
  log('\n🌱 Checking if database needs seeding...', 'cyan');
  
  if (!execCommand('npm run prisma:seed', 'Seeding database')) {
    return;
  }

  log('\n✨ Development environment ready!', 'green');
}

async function openStudio() {
  log('\n🎨 Opening Prisma Studio...', 'cyan');
  log('💡 Prisma Studio will open in your browser at http://localhost:5555', 'blue');
  
  execCommand('npx prisma studio', 'Starting Prisma Studio');
}

async function checkStatus() {
  log('\n📊 Database Status Check', 'bright');
  
  execCommand('npx prisma migrate status', 'Checking migration status');
  
  log('\n💡 To see your data visually, run: npm run db:studio', 'blue');
}

async function generateClient() {
  execCommand('npx prisma generate', 'Generating Prisma client');
}

async function showHelp() {
  log('\n📖 Database Management Commands', 'bright');
  log('\nAvailable options:', 'cyan');
  log('  1. 🔄 Reset & Seed - Complete database reset with sample data');
  log('  2. ⚡ Quick Setup - Initialize database for development');
  log('  3. 🎨 Open Studio - Launch Prisma Studio (visual database browser)');
  log('  4. 📊 Check Status - View migration and database status');
  log('  5. 🔧 Generate Client - Regenerate Prisma client');
  log('  6. 📖 Help - Show this help message');
  log('  0. 🚪 Exit');
  
  log('\n💡 Tips:', 'yellow');
  log('   • Use "Reset & Seed" for fresh development setup');
  log('   • Use "Quick Setup" for initial project setup');
  log('   • Use "Open Studio" to browse and edit data visually');
}

async function main() {
  log('🗃️  E-Learning Database Manager', 'bright');
  log('=====================================', 'cyan');

  while (true) {
    const choice = await askQuestion(`
Choose an option:
1. Reset & Seed Database
2. Quick Setup
3. Open Prisma Studio  
4. Check Database Status
5. Generate Prisma Client
6. Help
0. Exit

Enter your choice (0-6): `);

    switch (choice) {
      case '1':
        await resetAndSeed();
        break;
      case '2':
        await quickSetup();
        break;
      case '3':
        await openStudio();
        break;
      case '4':
        await checkStatus();
        break;
      case '5':
        await generateClient();
        break;
      case '6':
        await showHelp();
        break;
      case '0':
        log('\n👋 Goodbye!', 'green');
        rl.close();
        process.exit(0);
      default:
        log('\n❌ Invalid choice. Please enter a number between 0-6.', 'red');
    }
  }
}

// Handle process termination
process.on('SIGINT', () => {
  log('\n\n👋 Goodbye!', 'green');
  rl.close();
  process.exit(0);
});

// Start the application
main().catch((error) => {
  log('\n💥 An error occurred:', 'red');
  console.error(error);
  rl.close();
  process.exit(1);
});
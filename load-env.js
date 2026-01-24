/**
 * Simple script to load API keys from .env file for local development
 * This script reads the .env file and prompts you to update script.js
 * 
 * Usage: node load-env.js
 */

const fs = require('fs');
const path = require('path');

// Read .env file
const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found!');
    console.log('\n📝 Please create a .env file:');
    console.log('   1. Copy .env.example to .env');
    console.log('   2. Add your API keys to .env');
    console.log('   3. Run this script again\n');
    process.exit(1);
}

// Parse .env file
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').trim();
        if (key && value) {
            envVars[key] = value;
        }
    }
});

// Check if keys are present
const requiredKeys = ['OPENAI_API_KEY', 'GOOGLE_API_KEY', 'GOOGLE_CSE_ID'];
const missingKeys = requiredKeys.filter(key => !envVars[key] || envVars[key].includes('your_'));

if (missingKeys.length > 0) {
    console.error('❌ Missing or placeholder API keys in .env:');
    missingKeys.forEach(key => console.log(`   - ${key}`));
    console.log('\n📝 Please update your .env file with actual API keys\n');
    process.exit(1);
}

// Display configuration
console.log('✅ Environment variables loaded successfully!\n');
console.log('📋 Configuration:');
console.log(`   OPENAI_API_KEY: ${envVars.OPENAI_API_KEY.substring(0, 20)}...`);
console.log(`   GOOGLE_API_KEY: ${envVars.GOOGLE_API_KEY.substring(0, 20)}...`);
console.log(`   GOOGLE_CSE_ID: ${envVars.GOOGLE_CSE_ID}`);
console.log('\n⚠️  IMPORTANT for Browser Apps:');
console.log('   Since Voxon runs in the browser, you need to:');
console.log('   1. Manually update script.js lines 9-11 with these keys for development');
console.log('   2. OR create a backend server to proxy API calls (recommended for production)');
console.log('   3. OR use a build tool like Vite to inject env vars at build time\n');

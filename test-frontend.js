// Test script to check if there are import errors in the frontend
// This will help us identify any Base44 or import issues

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Frontend Import Issues...\n');

// Test 1: Check if main.jsx can be statically analyzed
try {
  const mainJsx = fs.readFileSync('src/main.jsx', 'utf8');
  console.log('✅ main.jsx reads successfully');
  
  // Check for any Base44 references
  if (mainJsx.includes('base44') || mainJsx.includes('Base44')) {
    console.log('❌ Found Base44 references in main.jsx');
  } else {
    console.log('✅ No Base44 references in main.jsx');
  }
} catch (error) {
  console.log('❌ Error reading main.jsx:', error.message);
}

// Test 2: Check critical imports
const criticalFiles = [
  'src/App.jsx',
  'src/pages/index.jsx',
  'src/api/base44Client.js',
  'src/api/entities.js',
  'src/api/localApiClient.js'
];

for (const file of criticalFiles) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for import errors
    const hasBase44Import = content.includes('from \'@base44/sdk\'') || content.includes('import { createClient } from \'@base44/sdk\'');
    const hasLocalImport = content.includes('localApiClient') || content.includes('./localApiClient');
    
    console.log(`📄 ${file}:`);
    if (hasBase44Import) {
      console.log('  ❌ Still has @base44/sdk imports');
    } else {
      console.log('  ✅ No @base44/sdk imports');
    }
    
    if (hasLocalImport) {
      console.log('  ✅ Has local API client imports');
    }
    
  } catch (error) {
    console.log(`❌ Error reading ${file}:`, error.message);
  }
}

// Test 3: Check for any remaining Base44 references in source
console.log('\n🔍 Scanning for remaining Base44 references...');

function scanDirectory(dir, extensions = ['.js', '.jsx']) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  let foundReferences = false;
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory() && !['node_modules', '.git', 'dist', 'logs'].includes(file.name)) {
      if (scanDirectory(fullPath, extensions)) {
        foundReferences = true;
      }
    } else if (file.isFile() && extensions.some(ext => file.name.endsWith(ext))) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('@base44/sdk') || content.includes('createClient')) {
          console.log(`❌ Found Base44 reference in: ${fullPath}`);
          foundReferences = true;
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }
  }
  
  return foundReferences;
}

const hasReferences = scanDirectory('src');
if (!hasReferences) {
  console.log('✅ No Base44 SDK references found in source code');
}

console.log('\n🎯 Frontend Test Complete!');
console.log('\nℹ️  If the frontend still shows a blank page:');
console.log('   1. Check browser console for JavaScript errors');  
console.log('   2. Try opening browser dev tools (F12)');
console.log('   3. Look for network request failures');
console.log('   4. Check if http://localhost:5173/ shows React loading');
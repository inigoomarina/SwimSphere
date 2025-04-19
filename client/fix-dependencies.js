/**
 * Enhanced dependency fixer for SwimSphere client
 * Run with: node fix-dependencies.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 SwimSphere Client Dependency Fixer (Enhanced)');
console.log('===============================================');

try {
  // Step 1: Update react-scripts
  console.log('\n📦 Updating react-scripts to v5.0.1...');
  execSync('npm install --legacy-peer-deps react-scripts@5.0.1', { stdio: 'inherit' });
  
  // Step 2: Install chart.js dependencies
  console.log('\n📊 Installing chart.js and react-chartjs-2...');
  execSync('npm install --legacy-peer-deps chart.js@3.9.1 react-chartjs-2@4.3.1', { stdio: 'inherit' });
  
  // Step 3: Install socket.io-client
  console.log('\n🔌 Installing socket.io-client...');
  execSync('npm install --legacy-peer-deps socket.io-client', { stdio: 'inherit' });
  
  // Step 4: Fix common security vulnerabilities
  console.log('\n🛡️ Installing security fixes...');
  execSync('npm install --save-dev --legacy-peer-deps nth-check@2.1.1 postcss@8.4.31 css-select@5.1.0 svgo@3.3.2 resolve-url-loader@5.0.0', { stdio: 'inherit' });
  
  // Step 5: Add more security fixes for transitive dependencies
  console.log('\n🔒 Adding additional security fixes...');
  execSync('npm install --save-dev --legacy-peer-deps semver@7.5.4 terser@5.14.2 tough-cookie@4.1.3 webpack-dev-middleware@5.3.4 shell-quote@1.7.3', { stdio: 'inherit' });
  
  // Step 6: Update package.json with overrides if not present
  console.log('\n📝 Updating package.json with overrides...');
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (!packageJson.overrides) {
    packageJson.overrides = {
      "nth-check": "^2.1.1",
      "postcss": "^8.4.31",
      "css-select": "^5.1.0",
      "svgo": "^3.3.2",
      "semver": "^7.5.4",
      "terser": "^5.14.2",
      "tough-cookie": "^4.1.3",
      "webpack-dev-middleware": "^5.3.4",
      "shell-quote": "^1.7.3",
      "resolve-url-loader": "^5.0.0"
    };
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Added overrides to package.json');
  }
  
  // Step 7: Clean node_modules and reinstall with overrides
  console.log('\n🧹 Cleaning installation and reinstalling with overrides...');
  try {
    execSync('npm cache clean --force', { stdio: 'inherit' });
    execSync('rm -rf node_modules', { stdio: 'inherit' });
  } catch (e) {
    // On Windows, the command might fail, try with rimraf
    console.log('Trying alternative method for cleanup...');
    execSync('npx rimraf node_modules', { stdio: 'inherit' });
  }
  
  // Reinstall everything
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  
  // Step 8: Check for remaining issues
  console.log('\n🔍 Checking for remaining issues...');
  execSync('npm audit', { stdio: 'inherit' });
  
  console.log('\n✅ Enhanced dependency fixes completed!');
  console.log('\n⚠️ Note: Some vulnerabilities may still show up in npm audit.');
  console.log('   These are often from dev dependencies and generally safe to ignore during development.');
  console.log('   You can run "npm audit --production" to see only production vulnerabilities.');
  
} catch (error) {
  console.error('\n❌ Error occurred:', error.message);
  console.log('\nPlease try running the commands manually as described in the README.md');
}

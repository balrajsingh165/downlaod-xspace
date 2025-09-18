#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('🔧 Fixing dependencies...\n');

// Clean up any existing incompatible binaries
const binDir = path.join(process.cwd(), 'bin');
if (fs.existsSync(binDir)) {
    console.log('🧹 Cleaning up existing binaries...');
    const files = fs.readdirSync(binDir);
    files.forEach(file => {
        const filePath = path.join(binDir, file);
        try {
            fs.unlinkSync(filePath);
            console.log(`🗑️  Removed: ${file}`);
        } catch (error) {
            console.log(`⚠️  Could not remove: ${file}`);
        }
    });
}

// Try to install yt-dlp via pip first
console.log('\n🐍 Installing yt-dlp via pip...');
exec('pip3 install yt-dlp', (error, stdout, stderr) => {
    if (error) {
        console.log('❌ pip installation failed, trying pip...');
        exec('pip install yt-dlp', (pipError, pipStdout, pipStderr) => {
            if (pipError) {
                console.log('❌ Both pip3 and pip failed');
                console.log('📋 Please install yt-dlp manually:');
                console.log('   pip3 install yt-dlp');
                console.log('   or');
                console.log('   pip install yt-dlp');
                process.exit(1);
            } else {
                console.log('✅ yt-dlp installed via pip');
                testYtDlp();
            }
        });
    } else {
        console.log('✅ yt-dlp installed via pip3');
        testYtDlp();
    }
});

function testYtDlp() {
    console.log('\n🧪 Testing yt-dlp...');
    exec('yt-dlp --version', (error, stdout, stderr) => {
        if (error) {
            console.log('❌ yt-dlp test failed:', error.message);
            process.exit(1);
        } else {
            console.log('✅ yt-dlp is working correctly');
            console.log('🎉 Dependencies fixed! You can now run: npm run dev');
        }
    });
}

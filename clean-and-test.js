#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('🧹 Cleaning up and testing...\n');

// Remove the incompatible binary
const binDir = path.join(process.cwd(), 'bin');
const ytDlpPath = path.join(binDir, 'yt-dlp');

if (fs.existsSync(ytDlpPath)) {
    try {
        fs.unlinkSync(ytDlpPath);
        console.log('✅ Removed incompatible yt-dlp binary');
    } catch (error) {
        console.log('❌ Could not remove binary:', error.message);
    }
}

// Test if yt-dlp is available globally
console.log('\n🧪 Testing global yt-dlp...');
exec('yt-dlp --version', (error, stdout, stderr) => {
    if (error) {
        console.log('❌ yt-dlp not found globally');
        console.log('📋 Installing yt-dlp via pip...');

        exec('pip3 install yt-dlp', (pipError, pipStdout, pipStderr) => {
            if (pipError) {
                console.log('❌ pip3 failed, trying pip...');
                exec('pip install yt-dlp', (pip2Error, pip2Stdout, pip2Stderr) => {
                    if (pip2Error) {
                        console.log('❌ Both pip installations failed');
                        console.log('📋 Please install manually: pip3 install yt-dlp');
                        process.exit(1);
                    } else {
                        console.log('✅ yt-dlp installed via pip');
                        testFinal();
                    }
                });
            } else {
                console.log('✅ yt-dlp installed via pip3');
                testFinal();
            }
        });
    } else {
        console.log('✅ yt-dlp found globally');
        testFinal();
    }
});

function testFinal() {
    console.log('\n🧪 Final test...');
    exec('yt-dlp --version', (error, stdout, stderr) => {
        if (error) {
            console.log('❌ Final test failed:', error.message);
            process.exit(1);
        } else {
            console.log('✅ yt-dlp is working correctly');
            console.log('🎉 Ready to run: pnpm run dev');
        }
    });
}

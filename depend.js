#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');
const https = require('https');
const { createWriteStream } = require('fs');

const DEPENDENCIES = {
    'yt-dlp': {
        url: 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp',
        filename: 'yt-dlp',
        executable: true
    },
    'ffmpeg': {
        // We'll check if ffmpeg is available, if not provide instructions
        checkCommand: 'ffmpeg -version',
        installInstructions: 'Please install ffmpeg using your package manager:\n  Ubuntu/Debian: sudo apt update && sudo apt install ffmpeg\n  CentOS/RHEL: sudo yum install ffmpeg\n  Arch: sudo pacman -S ffmpeg\n  Or download from: https://ffmpeg.org/download.html'
    }
};

class DependencyManager {
    constructor() {
        this.baseDir = process.cwd();
        this.binDir = path.join(this.baseDir, 'bin');
        this.ensureBinDir();
    }

    ensureBinDir() {
        if (!fs.existsSync(this.binDir)) {
            fs.mkdirSync(this.binDir, { recursive: true });
            console.log('📁 Created bin directory');
        }
    }

    async checkDependency(name, config) {
        console.log(`🔍 Checking ${name}...`);

        if (name === 'yt-dlp') {
            return await this.checkYtDlp(config);
        } else if (name === 'ffmpeg') {
            return await this.checkFfmpeg(config);
        }

        return false;
    }

    async checkYtDlp(config) {
        const ytDlpPath = path.join(this.binDir, config.filename);

        // Check if yt-dlp exists locally
        if (fs.existsSync(ytDlpPath)) {
            try {
                // Test if it's executable
                await this.execCommand(`${ytDlpPath} --version`);
                console.log(`✅ yt-dlp found locally: ${ytDlpPath}`);
                return true;
            } catch (error) {
                console.log('⚠️  yt-dlp exists but not executable, will re-download');
            }
        }

        // Check if yt-dlp is available globally
        try {
            await this.execCommand('yt-dlp --version');
            console.log('✅ yt-dlp found globally');
            return true;
        } catch (error) {
            console.log('❌ yt-dlp not found globally');
        }

        // Download yt-dlp
        console.log('📥 Downloading yt-dlp...');
        return await this.downloadYtDlp(config);
    }

    async checkFfmpeg(config) {
        try {
            await this.execCommand(config.checkCommand);
            console.log('✅ ffmpeg found');
            return true;
        } catch (error) {
            console.log('❌ ffmpeg not found');
            console.log(`\n📋 ${config.installInstructions}\n`);
            return false;
        }
    }

    async downloadYtDlp(config) {
        return new Promise((resolve, reject) => {
            const filePath = path.join(this.binDir, config.filename);
            const file = createWriteStream(filePath);

            console.log(`📥 Downloading from: ${config.url}`);

            https.get(config.url, (response) => {
                if (response.statusCode === 302 || response.statusCode === 301) {
                    // Follow redirect
                    https.get(response.headers.location, (redirectResponse) => {
                        redirectResponse.pipe(file);
                    });
                } else {
                    response.pipe(file);
                }
            }).on('error', (error) => {
                console.error('❌ Download failed:', error.message);
                reject(error);
            });

            file.on('finish', async () => {
                file.close();

                // Make executable
                try {
                    await this.execCommand(`chmod +x "${filePath}"`);
                    console.log('✅ yt-dlp downloaded and made executable');

                    // Test the downloaded yt-dlp
                    await this.execCommand(`"${filePath}" --version`);
                    console.log('✅ yt-dlp is working correctly');
                    resolve(true);
                } catch (error) {
                    console.error('❌ Failed to make yt-dlp executable or test it:', error.message);
                    reject(error);
                }
            });

            file.on('error', (error) => {
                console.error('❌ File write error:', error.message);
                reject(error);
            });
        });
    }

    async execCommand(command) {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(stdout);
                }
            });
        });
    }

    async checkAllDependencies() {
        console.log('🚀 Checking dependencies...\n');

        const results = {};
        let allGood = true;

        for (const [name, config] of Object.entries(DEPENDENCIES)) {
            try {
                results[name] = await this.checkDependency(name, config);
                if (!results[name]) {
                    allGood = false;
                }
            } catch (error) {
                console.error(`❌ Error checking ${name}:`, error.message);
                results[name] = false;
                allGood = false;
            }
            console.log(''); // Empty line for readability
        }

        return { results, allGood };
    }

    generateEnvFile() {
        const envContent = `# Dependencies configuration
YT_DLP_PATH=${path.join(this.binDir, 'yt-dlp')}
FFMPEG_PATH=ffmpeg
`;

        const envPath = path.join(this.baseDir, '.env.local');
        fs.writeFileSync(envPath, envContent);
        console.log('📝 Created .env.local with dependency paths');
    }

    printSummary(results) {
        console.log('📊 Dependency Check Summary:');
        console.log('============================');

        Object.entries(results).forEach(([name, status]) => {
            const icon = status ? '✅' : '❌';
            console.log(`${icon} ${name}: ${status ? 'Available' : 'Missing'}`);
        });

        console.log('============================\n');
    }
}

async function main() {
    console.log('🎙️  Twitter Space Downloader - Dependency Manager');
    console.log('================================================\n');

    const manager = new DependencyManager();

    try {
        const { results, allGood } = await manager.checkAllDependencies();

        manager.printSummary(results);

        if (allGood) {
            console.log('🎉 All dependencies are available!');
            console.log('🚀 You can now run: npm run dev');
        } else {
            console.log('⚠️  Some dependencies are missing.');
            console.log('📋 Please install the missing dependencies and run this script again.');

            if (!results['ffmpeg']) {
                console.log('\n💡 For ffmpeg, you can also try:');
                console.log('   - Using a package manager (recommended)');
                console.log('   - Downloading from https://ffmpeg.org/download.html');
                console.log('   - Using a static build from https://johnvansickle.com/ffmpeg/');
            }
        }

        // Generate environment file with paths
        manager.generateEnvFile();

    } catch (error) {
        console.error('💥 Fatal error:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = DependencyManager;

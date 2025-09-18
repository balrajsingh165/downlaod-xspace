#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to clean up old files, keeping only the last 5
function cleanupOldFiles(downloadsDir) {
    try {
        console.log('🧹 Starting cleanup of old download files...');

        if (!fs.existsSync(downloadsDir)) {
            console.log('📁 Downloads directory does not exist, nothing to clean');
            return;
        }

        const files = fs.readdirSync(downloadsDir)
            .filter(file => file.endsWith('.mp3'))
            .map(file => {
                const filePath = path.join(downloadsDir, file)
                const stats = fs.statSync(filePath)
                return {
                    name: file,
                    path: filePath,
                    created_at: stats.birthtime
                }
            })
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

        console.log(`📊 Found ${files.length} MP3 files`);

        // Always keep only 5 files - delete all files beyond the 5 newest
        if (files.length > 5) {
            const filesToDelete = files.slice(5) // Get all files after the 5th newest
            console.log(`🗑️  Deleting ${filesToDelete.length} old files...`);

            filesToDelete.forEach(file => {
                try {
                    fs.unlinkSync(file.path)
                    console.log(`   ✅ Deleted: ${file.name}`)
                } catch (error) {
                    console.error(`   ❌ Failed to delete ${file.name}:`, error.message)
                }
            })
            console.log(`🎉 Cleanup complete: Kept ${files.length - filesToDelete.length} files, deleted ${filesToDelete.length} old files`)
        } else {
            console.log(`✅ No cleanup needed: Only ${files.length} files present (max 5 allowed)`)
        }
    } catch (error) {
        console.error('❌ Error cleaning up old files:', error.message)
    }
}

// Main execution
const downloadsDir = path.join(process.cwd(), 'public', 'downloads');
cleanupOldFiles(downloadsDir);

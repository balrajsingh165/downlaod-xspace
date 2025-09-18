import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'

// Function to clean up old files, keeping only the last 5
function cleanupOldFiles(downloadsDir: string) {
    try {
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

        // Always keep only 5 files - delete all files beyond the 5 newest
        if (files.length > 5) {
            const filesToDelete = files.slice(5) // Get all files after the 5th newest
            filesToDelete.forEach(file => {
                try {
                    fs.unlinkSync(file.path)
                    console.log(`Deleted old file: ${file.name}`)
                } catch (error) {
                    console.error(`Failed to delete file ${file.name}:`, error)
                }
            })
            console.log(`Cleanup complete: Kept ${files.length - filesToDelete.length} files, deleted ${filesToDelete.length} old files`)
        } else {
            console.log(`No cleanup needed: Only ${files.length} files present (max 5 allowed)`)
        }
    } catch (error) {
        console.error('Error cleaning up old files:', error)
    }
}

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json()

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 })
        }

        // Validate URL format
        const twitterSpacePattern = /^https?:\/\/(twitter\.com|x\.com)\/i\/spaces\/\w+/
        if (!twitterSpacePattern.test(url)) {
            return NextResponse.json({ error: 'Invalid Twitter Spaces URL' }, { status: 400 })
        }

        // Create downloads directory
        const downloadsDir = path.join(process.cwd(), 'downloads')
        if (!fs.existsSync(downloadsDir)) {
            fs.mkdirSync(downloadsDir, { recursive: true })
        }

        // Run the Python downloader script
        const pythonScript = path.join(process.cwd(), 'scripts', 'downloader.py')

        // Set environment variables for dependencies
        const env = {
            ...process.env,
            YT_DLP_PATH: process.env.YT_DLP_PATH || path.join(process.cwd(), 'bin', 'yt-dlp'),
            FFMPEG_PATH: process.env.FFMPEG_PATH || 'ffmpeg'
        }

        return new Promise((resolve) => {
            const python = spawn('python', [pythonScript, url], {
                cwd: process.cwd(),
                stdio: ['pipe', 'pipe', 'pipe'],
                env: env
            })

            let stdout = ''
            let stderr = ''

            python.stdout.on('data', (data) => {
                stdout += data.toString()
            })

            python.stderr.on('data', (data) => {
                stderr += data.toString()
            })

            python.on('close', (code) => {
                console.log('Python process closed with code:', code)
                console.log('STDOUT:', stdout)
                console.log('STDERR:', stderr)

                try {
                    const result = JSON.parse(stdout)

                    if (result.success) {
                        // Move file to public directory for serving
                        const publicDir = path.join(process.cwd(), 'public', 'downloads')
                        if (!fs.existsSync(publicDir)) {
                            fs.mkdirSync(publicDir, { recursive: true })
                        }

                        const sourceFile = result.file_path
                        const fileName = result.file_name
                        const destFile = path.join(publicDir, fileName)

                        if (fs.existsSync(sourceFile)) {
                            fs.copyFileSync(sourceFile, destFile)
                            // Clean up original file
                            fs.unlinkSync(sourceFile)

                            result.download_url = `/downloads/${fileName}`
                            delete result.file_path

                            // Clean up old files (keep only last 5)
                            cleanupOldFiles(publicDir)
                        }
                    }

                    resolve(NextResponse.json(result))
                } catch (error) {
                    console.error('JSON Parse Error:', error)
                    console.error('Raw stdout:', stdout)
                    console.error('Raw stderr:', stderr)

                    resolve(NextResponse.json({
                        error: 'Failed to parse download result',
                        details: stderr || stdout,
                        raw_stdout: stdout,
                        raw_stderr: stderr
                    }, { status: 500 }))
                }
            })

            python.on('error', (error) => {
                resolve(NextResponse.json({
                    error: 'Failed to start download process',
                    details: error.message
                }, { status: 500 }))
            })
        })

    } catch (error) {
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}

export async function GET() {
    try {
        const downloadsDir = path.join(process.cwd(), 'public', 'downloads')

        if (!fs.existsSync(downloadsDir)) {
            return NextResponse.json({ files: [] })
        }

        // Always cleanup old files first to ensure we only have 5
        cleanupOldFiles(downloadsDir)

        const files = fs.readdirSync(downloadsDir)
            .filter(file => file.endsWith('.mp3'))
            .map(file => {
                const filePath = path.join(downloadsDir, file)
                const stats = fs.statSync(filePath)
                return {
                    name: file,
                    size: stats.size,
                    download_url: `/downloads/${file}`,
                    created_at: stats.birthtime
                }
            })
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) // Sort by newest first
            .slice(0, 5) // Keep only last 5

        return NextResponse.json({ files })
    } catch (error) {
        return NextResponse.json({
            error: 'Failed to list downloads',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}

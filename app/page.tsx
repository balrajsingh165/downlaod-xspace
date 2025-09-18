'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import ThemeToggle from './components/ThemeToggle'

interface DownloadFile {
    name: string
    size: number
    download_url: string
    created_at: string
}

interface DownloadResult {
    success?: boolean
    error?: string
    file_name?: string
    file_size?: number
    title?: string
    uploader?: string
    duration?: number
    download_url?: string
}

export default function Home() {
    const [url, setUrl] = useState('')
    const [isDownloading, setIsDownloading] = useState(false)
    const [downloadResult, setDownloadResult] = useState<DownloadResult | null>(null)
    const [downloadFiles, setDownloadFiles] = useState<DownloadFile[]>([])
    const [error, setError] = useState('')
    const [progress, setProgress] = useState(0)

    // Load existing downloads on component mount
    useEffect(() => {
        loadDownloads()
    }, [])

    const loadDownloads = async () => {
        try {
            const response = await axios.get('/api/download')
            setDownloadFiles(response.data.files || [])
        } catch (error) {
            console.error('Failed to load downloads:', error)
        }
    }

    const handleDownload = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!url.trim()) {
            setError('Please enter a Twitter Spaces URL')
            return
        }

        setIsDownloading(true)
        setError('')
        setDownloadResult(null)
        setProgress(0)

        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) return prev
                return prev + Math.random() * 10
            })
        }, 1000)

        try {
            const response = await axios.post('/api/download', { url })
            const result = response.data

            if (result.success) {
                setProgress(100)
                setDownloadResult(result)
                // Reload downloads list
                await loadDownloads()
            } else {
                setError(result.error || 'Download failed')
            }
        } catch (error: any) {
            setError(error.response?.data?.error || 'Download failed')
        } finally {
            clearInterval(progressInterval)
            setIsDownloading(false)
            setProgress(0)
        }
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString()
    }

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="container">
            <ThemeToggle />

            {/* Hero Section */}
            <div className="hero-section slide-in-up">
                <h1 className="hero-title">
                    🎙️ Twitter Space Downloader
                </h1>
                <p className="hero-subtitle">
                    Download any Twitter Space as high-quality MP3 files instantly.
                    Preserve conversations, interviews, and discussions forever.
                </p>
            </div>

            {/* Main Download Card */}
            <div className="card fade-in">
                <div className="input-group">
                    <label htmlFor="url">
                        <span>🔗 Twitter Spaces URL</span>
                    </label>
                    <input
                        type="url"
                        id="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://twitter.com/i/spaces/1BdGYZmdzlQJX or https://x.com/i/spaces/1BdGYZmdzlQJX"
                        disabled={isDownloading}
                    />
                </div>

                <button
                    type="submit"
                    className="btn"
                    disabled={isDownloading || !url.trim()}
                    onClick={handleDownload}
                    style={{ width: '100%' }}
                >
                    {isDownloading ? (
                        <>
                            <span className="spinner"></span>
                            Downloading... {Math.round(progress)}%
                        </>
                    ) : (
                        <>
                            <span>⬇️</span>
                            Download Space
                        </>
                    )}
                </button>

                {isDownloading && (
                    <div className="progress-bar">
                        <div className="progress" style={{ width: `${progress}%` }}></div>
                    </div>
                )}

                {error && (
                    <div className="status error">
                        <strong>❌ Error:</strong> {error}
                    </div>
                )}

                {downloadResult && downloadResult.success && (
                    <div className="status success">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '1.5rem' }}>✅</span>
                            <strong style={{ fontSize: '1.1rem' }}>Download Complete!</strong>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <strong>📝 Title:</strong><br />
                                <span style={{ color: 'var(--gray-600)' }}>{downloadResult.title}</span>
                            </div>
                            <div>
                                <strong>👤 Host:</strong><br />
                                <span style={{ color: 'var(--gray-600)' }}>{downloadResult.uploader}</span>
                            </div>
                            <div>
                                <strong>⏱️ Duration:</strong><br />
                                <span style={{ color: 'var(--gray-600)' }}>{formatDuration(downloadResult.duration || 0)}</span>
                            </div>
                            <div>
                                <strong>💾 File Size:</strong><br />
                                <span style={{ color: 'var(--gray-600)' }}>{formatFileSize(downloadResult.file_size || 0)}</span>
                            </div>
                        </div>

                        <a
                            href={downloadResult.download_url}
                            download
                            className="btn btn-success"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <span>💾</span>
                            Download MP3
                        </a>
                    </div>
                )}

                {isDownloading && (
                    <div className="status info">
                        <strong>⏳ Processing...</strong> This may take a few minutes depending on the length of the space.
                        Please don't close this page.
                    </div>
                )}
            </div>

            {/* Stats Section */}
            {downloadFiles.length > 0 && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-number">{downloadFiles.length}</div>
                        <div className="stat-label">Total Downloads</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">
                            {formatFileSize(downloadFiles.reduce((acc, file) => acc + file.size, 0))}
                        </div>
                        <div className="stat-label">Total Size</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">
                            {downloadFiles.length > 0 ? Math.round(downloadFiles.reduce((acc, file) => acc + file.size, 0) / downloadFiles.length / 1024 / 1024) : 0}MB
                        </div>
                        <div className="stat-label">Average Size</div>
                    </div>
                </div>
            )}

            {/* Previous Downloads */}
            {downloadFiles.length > 0 && (
                <div className="card fade-in">
                    <h2 className="section-title">
                        📁 Previous Downloads
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {downloadFiles.map((file, index) => (
                            <div key={index} className="download-item">
                                <div className="file-info">
                                    <div className="file-name">🎵 {file.name}</div>
                                    <div className="file-size">
                                        <span>💾 {formatFileSize(file.size)}</span>
                                        <span>•</span>
                                        <span>📅 {formatDate(file.created_at)}</span>
                                    </div>
                                </div>
                                <div className="actions">
                                    <a
                                        href={file.download_url}
                                        download
                                        className="btn btn-secondary"
                                        style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}
                                    >
                                        <span>⬇️</span>
                                        Download
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Features Section */}
            <div className="feature-grid">
                <div className="feature-card slide-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="feature-icon">🎯</div>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--gray-800)' }}>Easy to Use</h3>
                    <p style={{ color: 'var(--gray-600)', lineHeight: '1.6' }}>
                        Simply paste a Twitter Spaces URL and click download. No registration or complex setup required.
                    </p>
                </div>

                <div className="feature-card slide-in-up" style={{ animationDelay: '0.2s' }}>
                    <div className="feature-icon">⚡</div>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--gray-800)' }}>Fast Processing</h3>
                    <p style={{ color: 'var(--gray-600)', lineHeight: '1.6' }}>
                        Optimized download process that converts spaces to MP3 format quickly and efficiently.
                    </p>
                </div>

                <div className="feature-card slide-in-up" style={{ animationDelay: '0.3s' }}>
                    <div className="feature-icon">🔒</div>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--gray-800)' }}>Privacy First</h3>
                    <p style={{ color: 'var(--gray-600)', lineHeight: '1.6' }}>
                        Your downloads are processed securely and files are stored temporarily for your convenience.
                    </p>
                </div>
            </div>

            {/* How to Use */}
            <div className="card fade-in">
                <h2 className="section-title">
                    📖 How to Use
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                            color: 'white',
                            width: '2rem',
                            height: '2rem',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            flexShrink: 0
                        }}>
                            1
                        </div>
                        <div>
                            <h4 style={{ marginBottom: '0.5rem', color: 'var(--gray-800)' }}>Find a Space</h4>
                            <p style={{ color: 'var(--gray-600)', margin: 0 }}>Navigate to any Twitter Space you want to download</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                            color: 'white',
                            width: '2rem',
                            height: '2rem',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            flexShrink: 0
                        }}>
                            2
                        </div>
                        <div>
                            <h4 style={{ marginBottom: '0.5rem', color: 'var(--gray-800)' }}>Copy URL</h4>
                            <p style={{ color: 'var(--gray-600)', margin: 0 }}>Copy the URL from your browser address bar</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                            color: 'white',
                            width: '2rem',
                            height: '2rem',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            flexShrink: 0
                        }}>
                            3
                        </div>
                        <div>
                            <h4 style={{ marginBottom: '0.5rem', color: 'var(--gray-800)' }}>Paste & Download</h4>
                            <p style={{ color: 'var(--gray-600)', margin: 0 }}>Paste the URL above and click download</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                            color: 'white',
                            width: '2rem',
                            height: '2rem',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            flexShrink: 0
                        }}>
                            4
                        </div>
                        <div>
                            <h4 style={{ marginBottom: '0.5rem', color: 'var(--gray-800)' }}>Get Your File</h4>
                            <p style={{ color: 'var(--gray-600)', margin: 0 }}>Download your MP3 file when ready</p>
                        </div>
                    </div>
                </div>

                <div style={{
                    marginTop: '2rem',
                    padding: '1.5rem',
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid #bae6fd'
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>ℹ️</span>
                        <div>
                            <strong style={{ color: 'var(--gray-800)', display: 'block', marginBottom: '0.5rem' }}>System Requirements</strong>
                            <p style={{ color: 'var(--gray-600)', margin: 0, fontSize: '0.9rem' }}>
                                This tool requires <code style={{ background: 'rgba(0,0,0,0.1)', padding: '0.2rem 0.4rem', borderRadius: '0.25rem' }}>yt-dlp</code> and <code style={{ background: 'rgba(0,0,0,0.1)', padding: '0.2rem 0.4rem', borderRadius: '0.25rem' }}>ffmpeg</code> to be installed on the server.
                                Make sure these dependencies are available in your environment.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

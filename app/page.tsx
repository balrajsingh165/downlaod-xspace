'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

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
            {/* Hero Section */}
            <div className="hero-section slide-in-up">
                <h1 className="hero-title">
                    Twitter Space Downloader
                </h1>
                <p className="hero-subtitle">
                    Download Twitter Spaces as MP3 files
                </p>
            </div>

            {/* Main Download Card */}
            <div className="card fade-in">
                <div className="input-group">
                    <label htmlFor="url">
                        Twitter Spaces URL
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
                        'Download Space'
                    )}
                </button>

                {isDownloading && (
                    <div className="progress-bar">
                        <div className="progress" style={{ width: `${progress}%` }}></div>
                    </div>
                )}

                {error && (
                    <div className="status error">
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {downloadResult && downloadResult.success && (
                    <div className="status success">
                        <strong>Download Complete!</strong>
                        <br />
                        <strong>Title:</strong> <span style={{ color: '#1f2937', fontWeight: '600' }}>{downloadResult.title}</span>
                        <br />
                        <strong>Host:</strong> <span style={{ color: '#1f2937', fontWeight: '600' }}>{downloadResult.uploader}</span>
                        <br />
                        <strong>Duration:</strong> <span style={{ color: '#1f2937', fontWeight: '600' }}>{formatDuration(downloadResult.duration || 0)}</span>
                        <br />
                        <strong>File Size:</strong> <span style={{ color: '#1f2937', fontWeight: '600' }}>{formatFileSize(downloadResult.file_size || 0)}</span>
                        <br />
                        <a
                            href={downloadResult.download_url}
                            download
                            className="btn btn-success"
                            style={{ marginTop: '0.5rem', display: 'inline-block' }}
                        >
                            Download MP3
                        </a>
                    </div>
                )}

                {isDownloading && (
                    <div className="status info">
                        <strong>Processing...</strong> This may take a few minutes depending on the length of the space.
                    </div>
                )}
            </div>


            {/* Previous Downloads - Last 5 only */}
            {downloadFiles.length > 0 && (
                <div className="card fade-in">
                    <h2 className="section-title">
                        Recent Downloads
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {downloadFiles.slice(0, 5).map((file, index) => (
                            <div key={index} className="download-item">
                                <div className="file-info">
                                    <div className="file-name">{file.name}</div>
                                    <div className="file-size">
                                        <span>{formatFileSize(file.size)}</span>
                                        <span>•</span>
                                        <span>{formatDate(file.created_at)}</span>
                                    </div>
                                </div>
                                <div className="actions">
                                    <a
                                        href={file.download_url}
                                        download
                                        className="btn btn-secondary"
                                        style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}
                                    >
                                        Download
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}


        </div>
    )
}

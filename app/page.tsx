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

        try {
            const response = await axios.post('/api/download', { url })
            const result = response.data

            if (result.success) {
                setDownloadResult(result)
                // Reload downloads list
                await loadDownloads()
            } else {
                setError(result.error || 'Download failed')
            }
        } catch (error: any) {
            setError(error.response?.data?.error || 'Download failed')
        } finally {
            setIsDownloading(false)
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

    return (
        <div className="container">
            <div className="card">
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1f2937' }}>
                    Twitter Space Downloader
                </h1>
                <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                    Download Twitter Spaces as MP3 files. Enter a Twitter Spaces URL below to get started.
                </p>

                <form onSubmit={handleDownload}>
                    <div className="input-group">
                        <label htmlFor="url">Twitter Spaces URL</label>
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
                        disabled={isDownloading}
                        style={{ width: '100%' }}
                    >
                        {isDownloading ? (
                            <>
                                <span className="spinner" style={{ marginRight: '0.5rem' }}></span>
                                Downloading...
                            </>
                        ) : (
                            'Download Space'
                        )}
                    </button>
                </form>

                {error && (
                    <div className="status error">
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {downloadResult && downloadResult.success && (
                    <div className="status success">
                        <strong>Download Complete!</strong>
                        <br />
                        <strong>Title:</strong> {downloadResult.title}
                        <br />
                        <strong>Host:</strong> {downloadResult.uploader}
                        <br />
                        <strong>Duration:</strong> {downloadResult.duration} seconds
                        <br />
                        <strong>File Size:</strong> {formatFileSize(downloadResult.file_size || 0)}
                        <br />
                        <a
                            href={downloadResult.download_url}
                            download
                            className="btn btn-secondary"
                            style={{ marginTop: '0.5rem', display: 'inline-block' }}
                        >
                            Download MP3
                        </a>
                    </div>
                )}

                {isDownloading && (
                    <div className="status info">
                        <strong>Downloading...</strong> This may take a few minutes depending on the length of the space.
                    </div>
                )}
            </div>

            {downloadFiles.length > 0 && (
                <div className="card">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1f2937' }}>
                        Previous Downloads
                    </h2>
                    {downloadFiles.map((file, index) => (
                        <div key={index} className="download-item">
                            <div className="file-info">
                                <div className="file-name">{file.name}</div>
                                <div className="file-size">
                                    {formatFileSize(file.size)} • {formatDate(file.created_at)}
                                </div>
                            </div>
                            <div className="actions">
                                <a
                                    href={file.download_url}
                                    download
                                    className="btn btn-secondary"
                                    style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                >
                                    Download
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="card">
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1f2937' }}>
                    How to Use
                </h2>
                <ol style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
                    <li>Find a Twitter Space you want to download</li>
                    <li>Copy the URL from your browser (should look like <code>https://twitter.com/i/spaces/...</code> or <code>https://x.com/i/spaces/...</code>)</li>
                    <li>Paste the URL in the input field above</li>
                    <li>Click "Download Space" and wait for the download to complete</li>
                    <li>Download your MP3 file when ready</li>
                </ol>

                <div style={{ marginTop: '1rem', padding: '1rem', background: '#f3f4f6', borderRadius: '6px' }}>
                    <strong>Note:</strong> This tool requires <code>yt-dlp</code> and <code>ffmpeg</code> to be installed on the server.
                    Make sure these dependencies are available in your environment.
                </div>
            </div>
        </div>
    )
}

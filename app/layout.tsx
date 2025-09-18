import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Twitter Space Downloader - Download Spaces as MP3',
    description: 'Download any Twitter Space as high-quality MP3 files instantly. Preserve conversations, interviews, and discussions forever. Free and easy to use.',
    keywords: 'twitter spaces, download, mp3, audio, podcast, conversation, interview',
    authors: [{ name: 'Twitter Space Downloader' }],
    viewport: 'width=device-width, initial-scale=1',
    themeColor: '#6366f1',
    openGraph: {
        title: 'Twitter Space Downloader',
        description: 'Download any Twitter Space as high-quality MP3 files instantly',
        type: 'website',
        locale: 'en_US',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Twitter Space Downloader',
        description: 'Download any Twitter Space as high-quality MP3 files instantly',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>{children}</body>
        </html>
    )
}

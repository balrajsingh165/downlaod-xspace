# Twitter Space Downloader UI

A modern Next.js web application for downloading Twitter Spaces as MP3 files with a beautiful, responsive interface.

## ✨ Features

- 🎵 **High-Quality Downloads** - Download Twitter Spaces as MP3 files
- 🌐 **Web-Based Interface** - No command line knowledge required
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- 📁 **File Management** - Browse and download previous downloads
- ⚡ **Real-Time Updates** - Live download progress and status updates
- 🔒 **Secure** - All processing happens server-side
- 🎨 **Modern UI** - Clean, intuitive interface with Tailwind CSS

## 🚀 Quick Start

### Prerequisites

Before running this application, ensure you have these dependencies installed:

#### Required Dependencies

1. **yt-dlp** - YouTube downloader (works with Twitter Spaces)
   ```bash
   pip install yt-dlp
   ```

2. **ffmpeg** - Audio/video processing
   
   **Windows:**
   ```bash
   # Using Chocolatey
   choco install ffmpeg
   
   # Or download from https://ffmpeg.org/download.html
   ```
   
   **macOS:**
   ```bash
   brew install ffmpeg
   ```
   
   **Ubuntu/Debian:**
   ```bash
   sudo apt install ffmpeg
   ```

3. **Python** - Required for the downloader script
   - Python 3.7+ recommended

4. **Node.js** - For the Next.js application
   - Node.js 18+ recommended

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd twitter-space-downloader-ui
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Create necessary directories:**
   ```bash
   # Windows
   mkdir downloads
   mkdir public\downloads
   
   # Linux/macOS
   mkdir -p downloads public/downloads
   ```

4. **Make the Python script executable (Linux/macOS):**
   ```bash
   chmod +x scripts/downloader.py
   ```

### Running the Application

1. **Start the development server:**
   ```bash
   npm run dev
   # or
   pnpm run dev
   ```

2. **Open your browser and navigate to:**
   ```
   http://localhost:8855
   ```

## 📖 Usage

1. **Find a Twitter Space** you want to download
2. **Copy the URL** from your browser (should look like `https://twitter.com/i/spaces/...` or `https://x.com/i/spaces/...`)
3. **Paste the URL** in the input field on the homepage
4. **Click "Download Space"** and wait for the download to complete
5. **Download your MP3 file** when ready

### Supported URL Formats

- `https://twitter.com/i/spaces/1BdGYZmdzlQJX`
- `https://x.com/i/spaces/1BdGYZmdzlQJX`
- `https://twitter.com/username/status/1234567890` (if it's a space)
- `https://x.com/username/status/1234567890` (if it's a space)

## 🏗️ Project Structure

```
twitter-space-downloader-ui/
├── app/
│   ├── api/
│   │   └── download/
│   │       └── route.ts          # API endpoint for downloads
│   ├── globals.css              # Global styles with Tailwind
│   ├── layout.tsx               # Root layout component
│   └── page.tsx                 # Main homepage component
├── scripts/
│   └── downloader.py            # Python downloader script
├── downloads/                   # Temporary download directory
├── public/
│   └── downloads/               # Public downloads directory
├── .gitignore                  # Git ignore rules
├── next.config.js              # Next.js configuration
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── README.md                   # This file
```

## 🔌 API Endpoints

### `POST /api/download`
Download a Twitter Space as MP3.

**Request Body:**
```json
{
  "url": "https://twitter.com/i/spaces/1BdGYZmdzlQJX"
}
```

**Response:**
```json
{
  "success": true,
  "file_name": "Username - Space Title.mp3",
  "file_size": 15728640,
  "title": "Space Title",
  "uploader": "Username",
  "duration": 1800,
  "download_url": "/downloads/Username - Space Title.mp3"
}
```

### `GET /api/download`
List all downloaded files.

**Response:**
```json
{
  "files": [
    {
      "name": "Username - Space Title.mp3",
      "size": 15728640,
      "download_url": "/downloads/Username - Space Title.mp3",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. "yt-dlp not found" error
**Solution:**
```bash
# Install yt-dlp
pip install yt-dlp

# Verify installation
yt-dlp --version
```

#### 2. "ffmpeg not found" error
**Solution:**
```bash
# Windows (with Chocolatey)
choco install ffmpeg

# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg

# Verify installation
ffmpeg -version
```

#### 3. Download fails
**Possible causes:**
- Invalid Twitter Space URL
- Space is no longer available
- Network connectivity issues
- Insufficient disk space

**Solutions:**
- Verify the URL format
- Check if the space is still active
- Ensure stable internet connection
- Free up disk space

#### 4. Permission errors
**Windows:**
- Run as Administrator if needed
- Check folder permissions

**Linux/macOS:**
```bash
# Fix permissions
chmod 755 downloads/
chmod 755 public/downloads/
```

### Development Notes

- The application uses Python subprocess to run the downloader script
- Downloaded files are temporarily stored in `downloads/` then moved to `public/downloads/` for serving
- The Python script handles all the actual downloading logic using yt-dlp
- File cleanup is automatic after successful downloads
- The application runs on port 8855 by default

## 🚀 Production Deployment

### Build for Production

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start the production server:**
   ```bash
   npm start
   ```

### Environment Setup

1. **Install all dependencies** on your production server
2. **Set up proper file permissions** for the downloads directory
3. **Configure reverse proxy** (nginx) for better performance
4. **Set up process manager** (PM2) for production stability

### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine

# Install Python and dependencies
RUN apk add --no-cache python3 py3-pip ffmpeg
RUN pip3 install yt-dlp

# Copy application
COPY . /app
WORKDIR /app

# Install Node.js dependencies
RUN npm install

# Build application
RUN npm run build

# Expose port
EXPOSE 8855

# Start application
CMD ["npm", "start"]
```

## 📝 License

This project is for educational purposes. Please respect Twitter's terms of service and only download content you have permission to download.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Verify all dependencies are installed correctly
3. Check the console logs for detailed error messages
4. Ensure you have sufficient disk space and permissions

## 🔄 Updates

- **v1.0.0** - Initial release with basic download functionality
- **v1.1.0** - Added file management and improved UI
- **v1.2.0** - Added real-time progress updates and error handling

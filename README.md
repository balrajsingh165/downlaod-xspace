# 🎙️ Twitter Space Downloader

A professional Next.js application for downloading Twitter Spaces as high-quality MP3 files with a beautiful, modern UI.

## ✨ Features

- 🎯 **Easy to Use** - Simply paste a URL and download
- ⚡ **Fast Processing** - Optimized download and conversion
- 🔒 **Privacy First** - Secure processing and temporary storage
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 📱 **Responsive** - Works perfectly on all devices
- 📊 **Statistics** - Track your downloads and file sizes
- 🎨 **Modern UI** - Professional design with smooth animations

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Check System Requirements
```bash
npm run check-deps
```

This will automatically:
- Download `yt-dlp` if not available
- Check for `ffmpeg` installation
- Set up the required environment

### 3. Install Missing Dependencies (if needed)

**For ffmpeg on Linux:**
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install ffmpeg

# CentOS/RHEL
sudo yum install ffmpeg

# Arch Linux
sudo pacman -S ffmpeg
```

**For ffmpeg on macOS:**
```bash
brew install ffmpeg
```

**For ffmpeg on Windows:**
- Download from [https://ffmpeg.org/download.html](https://ffmpeg.org/download.html)
- Or use: `winget install ffmpeg`

### 4. Run the Application
```bash
npm run dev
```

### 5. Open Your Browser
Navigate to [http://localhost:8855](http://localhost:8855)

## 📋 System Requirements

- **Node.js** 18+ 
- **Python** 3.7+
- **ffmpeg** (for audio conversion)
- **yt-dlp** (automatically downloaded)

## 🎯 Usage

1. **Find a Space** - Navigate to any Twitter Space you want to download
2. **Copy URL** - Copy the URL from your browser address bar
3. **Paste & Download** - Paste the URL in the input field and click download
4. **Get Your File** - Download your MP3 file when ready

## 📁 Project Structure

```
├── app/
│   ├── api/download/     # API routes
│   ├── components/       # React components
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main page
├── scripts/
│   └── downloader.py     # Python downloader script
├── bin/                  # Downloaded dependencies
├── downloads/            # Temporary download storage
├── public/downloads/     # Served files
├── depend.js            # Dependency manager
└── package.json
```

## 🔧 Available Scripts

- `npm run dev` - Start development server (checks dependencies first)
- `npm run build` - Build for production (checks dependencies first)
- `npm run start` - Start production server
- `npm run check-deps` - Check and install dependencies
- `npm run install-deps` - Alias for check-deps
- `npm run lint` - Run ESLint

## 🌙 Dark Mode

The app includes a beautiful dark mode toggle in the top-right corner. Your preference is automatically saved and restored.

## 📱 Mobile Support

The application is fully responsive and works great on:
- 📱 Mobile phones
- 📱 Tablets  
- 💻 Laptops
- 🖥️ Desktop computers

## 🛠️ Troubleshooting

### yt-dlp not found
The dependency manager will automatically download `yt-dlp` to the `bin/` directory. If you still get errors:

1. Run `npm run check-deps` to verify installation
2. Check that the `bin/yt-dlp` file is executable
3. Try running `chmod +x bin/yt-dlp` on Linux/macOS

### ffmpeg not found
Install ffmpeg using your system's package manager (see Quick Start section).

### Permission errors
Make sure the `bin/` directory has proper permissions:
```bash
chmod +x bin/yt-dlp
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - For the excellent download capabilities
- [ffmpeg](https://ffmpeg.org/) - For audio conversion
- [Next.js](https://nextjs.org/) - For the amazing React framework
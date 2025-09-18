#!/usr/bin/env python3
"""
Twitter Spaces MP3 Downloader - API Version
Modified version of the original script for use with Next.js API
"""

import os
import subprocess
import re
import json
import sys
from pathlib import Path


def sanitize_filename(filename):
    """Remove invalid characters from filename"""
    # Remove invalid characters for Windows/Unix filenames
    invalid_chars = r'[<>:"/\\|?*]'
    filename = re.sub(invalid_chars, "_", filename)
    # Remove extra spaces and dots
    filename = re.sub(r"\s+", " ", filename).strip()
    filename = filename.strip(".")
    # Limit length
    if len(filename) > 200:
        filename = filename[:200]
    return filename


def is_valid_twitter_spaces_url(url):
    """Check if URL is a valid Twitter Spaces URL"""
    patterns = [
        r"https?://twitter\.com/i/spaces/\w+",
        r"https?://x\.com/i/spaces/\w+",
        r"https?://twitter\.com/\w+/status/\d+",  # Sometimes spaces are in tweets
        r"https?://x\.com/\w+/status/\d+",
    ]

    return any(re.match(pattern, url) for pattern in patterns)


def get_space_info(url):
    """Get Twitter Space information"""
    try:
        # Use environment variable for yt-dlp path, fallback to 'yt-dlp'
        yt_dlp_path = os.environ.get("YT_DLP_PATH", "yt-dlp")
        cmd = [yt_dlp_path, "--dump-single-json", "--no-warnings", url]

        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)

        if result.returncode != 0:
            return {"error": f"Error getting space info: {result.stderr}"}

        info = json.loads(result.stdout)
        return info

    except subprocess.TimeoutExpired:
        return {"error": "Timeout while getting space information"}
    except json.JSONDecodeError:
        return {"error": "Error parsing space information"}
    except Exception as e:
        return {"error": f"Error: {e}"}


def download_space(url, output_dir="downloads"):
    """Download Twitter Space as MP3"""

    # Validate URL
    if not is_valid_twitter_spaces_url(url):
        return {"error": "Invalid Twitter Spaces URL"}

    # Create output directory
    Path(output_dir).mkdir(exist_ok=True)

    # Get space info first
    space_info = get_space_info(url)

    if "error" in space_info:
        return space_info

    title = space_info.get("title", "Twitter Space")
    uploader = space_info.get("uploader", "Unknown")
    duration = space_info.get("duration", "Unknown duration")

    # Create filename
    safe_title = sanitize_filename(title)
    safe_uploader = sanitize_filename(uploader)
    filename = f"{safe_uploader} - {safe_title}.%(ext)s"

    # Download command - simplified like main.py
    yt_dlp_path = os.environ.get("YT_DLP_PATH", "yt-dlp")

    cmd = [
        yt_dlp_path,
        "--extract-audio",
        "--audio-format",
        "mp3",
        "--audio-quality",
        "0",  # Best quality
        "--output",
        os.path.join(output_dir, filename),
        "--no-warnings",
        url,
    ]

    try:
        # Use capture_output=True for API usage to get proper error messages
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=3600)

        if result.returncode == 0:
            # Find the downloaded file
            downloaded_files = list(Path(output_dir).glob("*.mp3"))
            if downloaded_files:
                file_path = downloaded_files[0]
                file_size = file_path.stat().st_size

                return {
                    "success": True,
                    "file_path": str(file_path),
                    "file_name": file_path.name,
                    "file_size": file_size,
                    "title": title,
                    "uploader": uploader,
                    "duration": duration,
                }
            else:
                return {"error": "Download completed but no MP3 file found"}
        else:
            # Return detailed error information
            error_msg = (
                result.stderr
                if result.stderr
                else f"Download failed with return code: {result.returncode}"
            )
            return {"error": f"Download failed: {error_msg}"}

    except subprocess.TimeoutExpired:
        return {"error": "Download timeout (max 1 hour)"}
    except Exception as e:
        return {"error": f"Error during download: {e}"}


def main():
    """Main function for command line usage"""
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: python downloader.py <url>"}))
        sys.exit(1)

    url = sys.argv[1]
    result = download_space(url)
    print(json.dumps(result))


if __name__ == "__main__":
    main()

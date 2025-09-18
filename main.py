#!/usr/bin/env python3
"""
Twitter Spaces MP3 Downloader
Download Twitter Spaces as MP3 audio files

Usage:
    python main.py <twitter_spaces_url>

Or set URL in the script and run:
    python main.py
"""

import os
import subprocess
import re
from pathlib import Path
import argparse

# Set your Twitter Spaces URL here if you don't want to pass it as argument
URL = "https://x.com/i/spaces/1BdGYZmdzlQJX/peek"


def check_dependencies():
    """Check if required dependencies are installed"""
    dependencies = ["yt-dlp", "ffmpeg"]
    missing = []

    for dep in dependencies:
        try:
            # For Windows, also try common installation paths
            if dep == "ffmpeg" and os.name == "nt":
                # Try common Windows paths first
                common_paths = [
                    "ffmpeg",  # In PATH
                    r"C:\ffmpeg\bin\ffmpeg.exe",
                    r"C:\Program Files\ffmpeg\bin\ffmpeg.exe",
                    os.path.expanduser(
                        r"~\AppData\Local\Microsoft\WinGet\Links\ffmpeg.exe"
                    ),
                ]

                ffmpeg_found = False
                for path in common_paths:
                    try:
                        result = subprocess.run(
                            [path, "-version"],
                            capture_output=True,
                            check=True,
                            timeout=10,
                            shell=True if path == "ffmpeg" else False,
                        )
                        print(f"✓ {dep} is installed ({path})")
                        ffmpeg_found = True
                        break
                    except (
                        subprocess.CalledProcessError,
                        FileNotFoundError,
                        subprocess.TimeoutExpired,
                    ):
                        continue

                if not ffmpeg_found:
                    missing.append(dep)
                    print(f"✗ {dep} is not installed or not in PATH")
            else:
                # Regular check for yt-dlp and non-Windows systems
                subprocess.run(
                    [dep, "--version"], capture_output=True, check=True, timeout=10
                )
                print(f"✓ {dep} is installed")

        except (
            subprocess.CalledProcessError,
            FileNotFoundError,
            subprocess.TimeoutExpired,
        ):
            missing.append(dep)
            print(f"✗ {dep} is not installed or not in PATH")

    if missing:
        print(f"\nMissing dependencies: {', '.join(missing)}")
        print("\nInstall missing dependencies:")
        if "yt-dlp" in missing:
            print("  pip install yt-dlp")
        if "ffmpeg" in missing:
            print("  # Install ffmpeg from https://ffmpeg.org/download.html")
            print("  # Or use package manager:")
            print("  # Windows: choco install ffmpeg")
            print("  # macOS: brew install ffmpeg")
            print("  # Ubuntu/Debian: sudo apt install ffmpeg")
        return False

    return True


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


def get_space_info(url):
    """Get Twitter Space information"""
    try:
        cmd = ["yt-dlp", "--dump-single-json", "--no-warnings", url]

        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)

        if result.returncode != 0:
            print(f"Error getting space info: {result.stderr}")
            return None

        import json

        info = json.loads(result.stdout)
        return info

    except subprocess.TimeoutExpired:
        print("Timeout while getting space information")
        return None
    except json.JSONDecodeError:
        print("Error parsing space information")
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None


def download_space(url, output_dir="downloads"):
    """Download Twitter Space as MP3"""

    print(f"Downloading from: {url}")

    # Create output directory
    Path(output_dir).mkdir(exist_ok=True)

    # Get space info first
    print("Getting space information...")
    space_info = get_space_info(url)

    if space_info:
        title = space_info.get("title", "Twitter Space")
        uploader = space_info.get("uploader", "Unknown")
        duration = space_info.get("duration", "Unknown duration")

        print(f"Title: {title}")
        print(f"Host: {uploader}")
        print(
            f"Duration: {duration} seconds"
            if isinstance(duration, (int, float))
            else f"Duration: {duration}"
        )

        # Create filename
        safe_title = sanitize_filename(title)
        safe_uploader = sanitize_filename(uploader)
        filename = f"{safe_uploader} - {safe_title}.%(ext)s"
    else:
        print("Could not get space info, using default filename")
        filename = "twitter_space_%(id)s.%(ext)s"

    # Download command
    cmd = [
        "yt-dlp",
        "--extract-audio",
        "--audio-format",
        "mp3",
        "--audio-quality",
        "0",  # Best quality
        "--output",
        os.path.join(output_dir, filename),
        "--no-warnings",
        "--progress",
        url,
    ]

    try:
        print("\nStarting download...")
        result = subprocess.run(cmd, timeout=3600)  # 1 hour timeout

        if result.returncode == 0:
            print("✓ Download completed successfully!")

            # List downloaded files
            print(f"\nFiles in {output_dir}:")
            for file in Path(output_dir).glob("*.mp3"):
                file_size = file.stat().st_size / (1024 * 1024)  # MB
                print(f"  {file.name} ({file_size:.1f} MB)")

        else:
            print("✗ Download failed!")
            return False

    except subprocess.TimeoutExpired:
        print("✗ Download timeout (max 1 hour)")
        return False
    except KeyboardInterrupt:
        print("\n✗ Download cancelled by user")
        return False
    except Exception as e:
        print(f"✗ Error during download: {e}")
        return False

    return True


def is_valid_twitter_spaces_url(url):
    """Check if URL is a valid Twitter Spaces URL"""
    patterns = [
        r"https?://twitter\.com/i/spaces/\w+",
        r"https?://x\.com/i/spaces/\w+",
        r"https?://twitter\.com/\w+/status/\d+",  # Sometimes spaces are in tweets
        r"https?://x\.com/\w+/status/\d+",
    ]

    return any(re.match(pattern, url) for pattern in patterns)


def main():
    parser = argparse.ArgumentParser(description="Download Twitter Spaces as MP3")
    parser.add_argument("url", nargs="?", help="Twitter Spaces URL")
    parser.add_argument(
        "-o",
        "--output",
        default="downloads",
        help="Output directory (default: downloads)",
    )
    parser.add_argument(
        "--check-deps", action="store_true", help="Check dependencies and exit"
    )

    args = parser.parse_args()

    # Check dependencies
    if args.check_deps:
        check_dependencies()
        return

    if not check_dependencies():
        print("\nPlease install missing dependencies before running the script.")
        return

    # Get URL from argument or script variable
    url = args.url or URL

    if not url:
        print("Error: No URL provided!")
        print("Either:")
        print("1. Pass URL as argument: python main.py <url>")
        print("2. Set URL variable in the script")
        print("\nExample URLs:")
        print("  https://twitter.com/i/spaces/1dRJZlEPOqmGB")
        print("  https://x.com/i/spaces/1dRJZlEPOqmGB")
        return

    # Validate URL
    if not is_valid_twitter_spaces_url(url):
        print(f"Warning: URL might not be a valid Twitter Spaces URL: {url}")
        response = input("Continue anyway? (y/N): ")
        if response.lower() not in ["y", "yes"]:
            return

    # Download
    success = download_space(url, args.output)

    if success:
        print("\n✓ Successfully downloaded Twitter Space!")
        print(f"Check the '{args.output}' folder for your MP3 file.")
    else:
        print("\n✗ Failed to download Twitter Space.")


if __name__ == "__main__":
    main()

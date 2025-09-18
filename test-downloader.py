#!/usr/bin/env python3
"""
Test script for the downloader.py
"""

import os
import sys

# Add the scripts directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "scripts"))

from downloader import download_space, get_space_info


def test_downloader():
    """Test the downloader functionality"""

    # Test URL (you can change this to any Twitter Space URL)
    test_url = "https://x.com/i/spaces/1BdGYZmdzlQJX"

    print("🧪 Testing Twitter Space Downloader")
    print("=" * 50)

    # Test 1: Get space info
    print("\n1. Testing space info retrieval...")
    try:
        info = get_space_info(test_url)
        if "error" in info:
            print(f"❌ Error getting space info: {info['error']}")
            return False
        else:
            print("✅ Space info retrieved successfully")
            print(f"   Title: {info.get('title', 'N/A')}")
            print(f"   Uploader: {info.get('uploader', 'N/A')}")
            print(f"   Duration: {info.get('duration', 'N/A')} seconds")
    except Exception as e:
        print(f"❌ Exception getting space info: {e}")
        return False

    # Test 2: Download space
    print("\n2. Testing space download...")
    try:
        result = download_space(test_url, "test_downloads")
        if "error" in result:
            print(f"❌ Download failed: {result['error']}")
            return False
        else:
            print("✅ Download completed successfully")
            print(f"   File: {result.get('file_name', 'N/A')}")
            print(f"   Size: {result.get('file_size', 0)} bytes")
            print(f"   Path: {result.get('file_path', 'N/A')}")

            # Clean up test file
            if "file_path" in result:
                try:
                    os.remove(result["file_path"])
                    print("🧹 Cleaned up test file")
                except:
                    pass

            return True
    except Exception as e:
        print(f"❌ Exception during download: {e}")
        return False


if __name__ == "__main__":
    success = test_downloader()
    if success:
        print("\n🎉 All tests passed!")
        sys.exit(0)
    else:
        print("\n❌ Tests failed!")
        sys.exit(1)

#!/usr/bin/env python3
"""
Test if the Python script returns proper JSON
"""

import subprocess
import json
import sys


def test_python_json():
    """Test if the Python script returns valid JSON"""

    # Test URL
    test_url = "https://x.com/i/spaces/1BdGYZmdzlQJX"

    print("🧪 Testing Python script JSON output")
    print("=" * 50)

    try:
        # Run the Python script
        result = subprocess.run(
            ["python", "scripts/downloader.py", test_url],
            capture_output=True,
            text=True,
            timeout=60,
        )

        print(f"Return code: {result.returncode}")
        print(f"STDOUT: {result.stdout}")
        print(f"STDERR: {result.stderr}")

        # Try to parse JSON
        try:
            json_result = json.loads(result.stdout)
            print("✅ JSON parsing successful!")
            print(f"Result: {json.dumps(json_result, indent=2)}")
            return True
        except json.JSONDecodeError as e:
            print(f"❌ JSON parsing failed: {e}")
            print(f"Raw output: {repr(result.stdout)}")
            return False

    except subprocess.TimeoutExpired:
        print("❌ Script timed out")
        return False
    except Exception as e:
        print(f"❌ Error running script: {e}")
        return False


if __name__ == "__main__":
    success = test_python_json()
    if success:
        print("\n🎉 Python script returns valid JSON!")
    else:
        print("\n❌ Python script has JSON issues!")
        sys.exit(1)

#!/usr/bin/env python3
"""
Test script for PDF Reader Flask Application
"""

import requests
import json
import sys

def test_server():
    """Test if the Flask server is running and responding"""
    base_url = "http://localhost:5000"
    
    print("🧪 Testing PDF Reader Flask Application")
    print("=" * 50)
    
    # Test 1: Main page
    try:
        response = requests.get(f"{base_url}/")
        if response.status_code == 200:
            print("✅ Main page loads successfully")
        else:
            print(f"❌ Main page failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to server: {e}")
        return False
    
    # Test 2: Health check
    try:
        response = requests.get(f"{base_url}/api/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data.get('status', 'unknown')}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check error: {e}")
    
    # Test 3: History API
    try:
        # Get history
        response = requests.get(f"{base_url}/api/history")
        if response.status_code == 200:
            print("✅ History GET endpoint working")
        
        # Add to history
        test_data = {"name": "test.pdf", "size": "1024 KB"}
        response = requests.post(f"{base_url}/api/history", 
                               json=test_data,
                               headers={"Content-Type": "application/json"})
        if response.status_code == 200:
            print("✅ History POST endpoint working")
            
        # Clear history (cleanup)
        response = requests.delete(f"{base_url}/api/history")
        if response.status_code == 200:
            print("✅ History DELETE endpoint working")
        
    except Exception as e:
        print(f"❌ History API error: {e}")
    
    # Test 4: Static files
    try:
        static_files = ["/static/styles.css", "/static/script.js", "/sw.js"]
        for file_path in static_files:
            response = requests.get(f"{base_url}{file_path}")
            if response.status_code == 200:
                print(f"✅ Static file {file_path} loads successfully")
            else:
                print(f"❌ Static file {file_path} failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Static files error: {e}")
    
    print("\n🎉 Server testing completed!")
    print("\n📖 Application Features:")
    print("  • PDF file upload and viewing")
    print("  • Audio file synchronization")
    print("  • Line-by-line text highlighting")
    print("  • Reading speed adjustment (100-300 WPM)")
    print("  • Reading history storage")
    print("  • Responsive design")
    
    return True

if __name__ == "__main__":
    test_server()

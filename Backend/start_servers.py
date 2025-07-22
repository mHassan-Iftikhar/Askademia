#!/usr/bin/env python3
"""
Startup script for Askademia backend services
Runs both WebSocket server (for real-time chat) and HTTP server (for API endpoints)
"""

import asyncio
import threading
import signal
import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def run_http_server():
    """Run HTTP server in a separate thread"""
    from http_server import run_http_server
    try:
        run_http_server()
    except KeyboardInterrupt:
        print("\nHTTP server stopped")

async def run_websocket_server():
    """Run WebSocket server"""
    from main_update import main
    try:
        await main()
    except KeyboardInterrupt:
        print("\nWebSocket server stopped")

def signal_handler(sig, frame):
    """Handle Ctrl+C gracefully"""
    print('\n\nShutting down servers...')
    sys.exit(0)

def main():
    """Main function to start both servers"""
    print("Starting Askademia Backend Services...")
    print("=" * 50)
    
    # Check for required environment variables
    if not os.getenv('GOOGLE_API_KEY'):
        print("❌ ERROR: GOOGLE_API_KEY not found in environment variables")
        print("Please create a .env file with your Google API key")
        print("Example: GOOGLE_API_KEY=your_api_key_here")
        sys.exit(1)
    
    # Set up signal handler for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    
    try:
        # Start HTTP server in a separate thread
        http_thread = threading.Thread(target=run_http_server, daemon=True)
        http_thread.start()
        print("✅ HTTP server started (API endpoints)")
        
        # Start WebSocket server in the main thread
        print("✅ Starting WebSocket server (real-time chat)...")
        asyncio.run(run_websocket_server())
        
    except Exception as e:
        print(f"❌ Error starting servers: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
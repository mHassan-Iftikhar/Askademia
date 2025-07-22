# Askademia Backend Services

This directory contains the backend services for the Askademia AI-powered learning platform.

## Architecture

The backend consists of two main services:

1. **WebSocket Server** (`main_update.py`) - Handles real-time AI chat and audio processing
2. **HTTP Server** (`http_server.py`) - Handles REST API endpoints like contact forms

## Prerequisites

- Python 3.8 or higher
- Google AI API key (Gemini API)

## Setup Instructions

### 1. Install Dependencies

```bash
cd Backend
pip install -r requirements.txt
```

### 2. Environment Configuration

Create a `.env` file in the Backend directory:

```bash
cp .env.example .env
```

Edit the `.env` file and add your Google AI API key:

```env
GOOGLE_API_KEY=your_google_api_key_here
HOST=0.0.0.0
PORT=8080
WEBSOCKET_PATH=/ws
HTTP_PORT=3001
SAMPLE_RATE=24000
AUDIO_FORMAT=pcm
```

### 3. Get Google AI API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your `.env` file

## Running the Services

### Option 1: Run All Services (Recommended)

```bash
python3 start_servers.py
```

This will start both:
- WebSocket server on `ws://localhost:8080`
- HTTP API server on `http://localhost:3001`

### Option 2: Run Services Separately

**WebSocket Server:**
```bash
python3 main_update.py
```

**HTTP API Server:**
```bash
python3 http_server.py
```

## API Endpoints

### WebSocket Endpoints

- `ws://localhost:8080` - Real-time AI chat and audio processing

**Message Format:**
```json
{
  "realtime_input": {
    "media_chunks": [
      {
        "mime_type": "audio/pcm",
        "data": "base64_encoded_audio_data"
      }
    ]
  }
}
```

### HTTP API Endpoints

- `POST /api/contact` - Submit contact form

**Request Format:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello, I have a question...",
  "to": "hassaniftikharco@gmail.com"
}
```

**Response Format:**
```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

## Frontend Integration

The frontend should connect to:

1. **WebSocket**: `ws://localhost:8080/ws` (for real-time chat)
2. **HTTP API**: `http://localhost:3001/api/*` (for REST endpoints)

### Vite Development Server

The Vite config includes proxy settings to route requests properly:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': 'http://localhost:3001',
    '/ws': {
      target: 'ws://localhost:8080',
      ws: true
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **"ModuleNotFoundError: No module named 'google'"**
   - Install dependencies: `pip install -r requirements.txt`

2. **"GOOGLE_API_KEY not found"**
   - Create `.env` file with your API key

3. **Port already in use**
   - Change ports in `.env` file or stop conflicting services

4. **WebSocket connection failed**
   - Ensure backend is running on correct port (8080)
   - Check firewall settings

### Testing Connections

**Test WebSocket:**
```bash
# Using websocat (install with: cargo install websocat)
websocat ws://localhost:8080
```

**Test HTTP API:**
```bash
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test message"}'
```

## File Structure

```
Backend/
├── main_update.py          # WebSocket server for AI chat
├── http_server.py          # HTTP server for API endpoints
├── start_servers.py        # Startup script for both servers
├── requirements.txt        # Python dependencies
├── .env.example           # Environment variables template
├── .env                   # Your environment variables (create this)
├── session_handle.json    # AI session persistence
└── README.md             # This file
```

## Development

### Adding New API Endpoints

1. Add handler method in `http_server.py`
2. Update the routing in `do_POST()` or `do_GET()`
3. Add CORS headers for frontend compatibility

### Modifying AI Behavior

1. Edit system instructions in `main_update.py`
2. Modify voice settings in the `LiveConnectConfig`
3. Adjust audio processing parameters

## Security Notes

- Never commit `.env` file to version control
- Use environment variables for all sensitive configuration
- Enable CORS only for development (configure properly for production)
- Consider adding authentication for production use

## Production Deployment

For production deployment:

1. Use a proper ASGI server (like Uvicorn) instead of the basic HTTP server
2. Set up reverse proxy (Nginx) for WebSocket and HTTP traffic
3. Configure SSL/TLS certificates
4. Set up proper logging and monitoring
5. Use environment-specific configuration files
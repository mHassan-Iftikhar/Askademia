from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class ContactHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        """Handle POST requests to /api/contact"""
        if self.path == '/api/contact':
            try:
                # Read and parse request body
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
                
                # Extract form data
                name = data.get('name', '')
                email = data.get('email', '')
                message = data.get('message', '')
                to_email = data.get('to', 'hassaniftikharco@gmail.com')
                
                # Validate required fields
                if not all([name, email, message]):
                    self.send_error_response(400, 'Missing required fields')
                    return
                
                # For demo purposes, just log the message
                print(f"Contact form submission:")
                print(f"Name: {name}")
                print(f"Email: {email}")
                print(f"Message: {message}")
                
                # Send success response
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                response = {
                    'success': True,
                    'message': 'Message sent successfully'
                }
                self.wfile.write(json.dumps(response).encode('utf-8'))
                
            except json.JSONDecodeError:
                self.send_error_response(400, 'Invalid JSON')
            except Exception as e:
                print(f"Error processing contact form: {e}")
                self.send_error_response(500, 'Internal server error')
        else:
            self.send_error_response(404, 'Endpoint not found')
    
    def send_error_response(self, status_code, message):
        """Send error response with CORS headers"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        error_response = {
            'success': False,
            'error': message
        }
        self.wfile.write(json.dumps(error_response).encode('utf-8'))

def run_http_server():
    """Run the HTTP server for API endpoints"""
    port = int(os.getenv('HTTP_PORT', 3001))
    server = HTTPServer(('localhost', port), ContactHandler)
    print(f"HTTP server started on http://localhost:{port}")
    server.serve_forever()

if __name__ == "__main__":
    run_http_server()
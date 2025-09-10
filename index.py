#!/usr/bin/env python3

from flask import Flask, render_template, jsonify, send_from_directory, make_response, request
from flask_cors import CORS
import os
import time

# Create Flask app with proper configuration for Vercel
app = Flask(__name__, 
    template_folder='templates',
    static_folder='static',
    static_url_path='/static'
)

CORS(app)

# Configuration
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

# Ensure upload directory exists
try:
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
except:
    pass

@app.route('/')
def home():
    """Serve the main PDF reader page"""
    try:
        timestamp = str(int(time.time()))
        response = make_response(render_template('index_new.html', timestamp=timestamp))
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        return response
    except Exception as e:
        # Fallback to basic HTML if template fails
        return f'''
        <!DOCTYPE html>
        <html>
        <head>
            <title>PDF Reader - Template Error</title>
            <style>
                body {{ font-family: Arial; margin: 50px; text-align: center; }}
                .error {{ background: #ffe6e6; padding: 20px; border-radius: 10px; margin: 20px 0; }}
            </style>
        </head>
        <body>
            <h1>🔧 PDF Reader</h1>
            <div class="error">
                <h3>Template Loading Error</h3>
                <p>Error: {str(e)}</p>
                <p>Working Directory: {os.getcwd()}</p>
                <p>Template Folder: {app.template_folder}</p>
            </div>
            <p><a href="/test">Test Route</a> | <a href="/health">Health Check</a> | <a href="/debug">Debug Info</a></p>
        </body>
        </html>
        '''

@app.route('/static/<path:filename>')
def static_files(filename):
    """Serve static files (CSS, JS, etc.)"""
    try:
        return send_from_directory('static', filename)
    except Exception as e:
        return f"Static file error: {str(e)}", 404

@app.route('/api/health')
def api_health_check():
    """Health check endpoint"""
    from datetime import datetime
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'message': 'PDF Reader Flask Server is running on Vercel'
    })

@app.route('/api/history', methods=['GET', 'POST', 'DELETE'])
def handle_history():
    """Handle reading history operations - Now using localStorage on client side"""
    import json
    from datetime import datetime
    
    if request.method == 'GET':
        # Return empty history - client will use localStorage
        return jsonify([])
    
    elif request.method == 'POST':
        # Acknowledge history save - client handles with localStorage
        return jsonify({'message': 'History handled by client localStorage'})
    
    elif request.method == 'DELETE':
        # Acknowledge history clear - client handles with localStorage
        return jsonify({'message': 'History cleared via client localStorage'})

@app.route('/api/history/<int:index>', methods=['DELETE'])
def delete_history_item(index):
    """Delete individual item from reading history - Now using localStorage"""
    return jsonify({
        'message': 'History deletion handled by client localStorage',
        'index': index
    })

@app.route('/test')
def test():
    return "PDF Reader Flask app is working on Vercel! 🎉"

@app.route('/health')
def health():
    return jsonify({
        "status": "ok", 
        "message": "PDF Reader is running!",
        "platform": "Vercel"
    })

@app.route('/debug')
def debug():
    return jsonify({
        "working_directory": os.getcwd(),
        "files": os.listdir('.') if os.path.exists('.') else [],
        "templates_exist": os.path.exists('templates'),
        "static_exist": os.path.exists('static'),
        "template_folder": app.template_folder,
        "static_folder": app.static_folder
    })

# Vercel expects this specific pattern
app_instance = app

if __name__ == '__main__':
    app.run(debug=True)

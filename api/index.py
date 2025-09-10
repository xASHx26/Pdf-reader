from flask import Flask, render_template, send_from_directory, jsonify, request, make_response
from flask_cors import CORS
import os
import json
import time
from datetime import datetime

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
def index():
    """Serve the main PDF reader page"""
    try:
        timestamp = str(int(time.time()))
        return render_template('index_new.html', timestamp=timestamp)
    except Exception as e:
        return f"Template Error: {str(e)}<br>Working Directory: {os.getcwd()}<br>Template Folder: {app.template_folder}"

@app.route('/test')
def test():
    """Simple test route"""
    return "PDF Reader Flask app is working on Vercel! 🎉"

@app.route('/debug')
def debug():
    """Debug information"""
    import sys
    return {
        "working_directory": os.getcwd(),
        "template_folder": app.template_folder,
        "static_folder": app.static_folder,
        "python_path": sys.path,
        "files_in_cwd": os.listdir('.') if os.path.exists('.') else "No access",
        "templates_exist": os.path.exists('templates'),
        "static_exist": os.path.exists('static')
    }

@app.route('/health')
def health():
    """Simple health check"""
    return jsonify({"status": "ok", "message": "PDF Reader is running!"})

@app.route('/static/<path:filename>')
def static_files(filename):
    """Serve static files"""
    try:
        return send_from_directory('static', filename)
    except Exception as e:
        return f"Static file error: {str(e)}", 404

# Vercel entry point
def handler(event, context):
    """Vercel serverless function handler"""
    return app(event, context)

# Alternative handler
app_handler = app

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)

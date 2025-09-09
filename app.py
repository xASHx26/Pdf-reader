from flask import Flask, render_template, send_from_directory, jsonify, request, make_response
from flask_cors import CORS
import os
import json
import time
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.route('/')
def index():
    """Serve the main PDF reader page"""
    timestamp = str(int(time.time()))
    response = make_response(render_template('index_new.html', timestamp=timestamp))
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@app.route('/static/<path:filename>')
def static_files(filename):
    """Serve static files (CSS, JS, etc.)"""
    response = send_from_directory('static', filename)
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@app.route('/sw.js')
def service_worker():
    """Serve service worker"""
    return send_from_directory('static', 'sw.js')

@app.route('/favicon.ico')
def favicon():
    """Serve favicon"""
    return send_from_directory('static', 'favicon.ico', mimetype='image/x-icon')

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'message': 'PDF Reader Flask Server is running'
    })

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Handle file uploads and store PDFs for history reload"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if file and file.filename.lower().endswith('.pdf'):
        filename = file.filename
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        return jsonify({
            'message': 'File uploaded successfully',
            'filename': filename,
            'size': os.path.getsize(file_path),
            'file_path': f'/api/pdf/{filename}'
        })
    
    return jsonify({'error': 'Invalid file type. Only PDF files are allowed'}), 400

@app.route('/api/pdf/<filename>')
def serve_pdf(filename):
    """Serve stored PDF files"""
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename, 
                                 mimetype='application/pdf',
                                 as_attachment=False)
    except FileNotFoundError:
        return jsonify({'error': 'PDF file not found'}), 404

@app.route('/api/history/<int:index>', methods=['DELETE'])
def delete_history_item(index):
    """Delete individual item from reading history"""
    history_file = 'data/history.json'
    
    try:
        # Load existing history
        if os.path.exists(history_file):
            with open(history_file, 'r') as f:
                history = json.load(f)
        else:
            return jsonify({'error': 'No history found'}), 404
        
        # Check if index is valid
        if 0 <= index < len(history):
            deleted_item = history.pop(index)
            
            # Save updated history
            with open(history_file, 'w') as f:
                json.dump(history, f, indent=2)
            
            return jsonify({
                'message': f'Deleted "{deleted_item.get("name", "Unknown")}" from history',
                'deleted_item': deleted_item
            })
        else:
            return jsonify({'error': 'Invalid index'}), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/history', methods=['GET', 'POST', 'DELETE'])
def handle_history():
    """Handle reading history operations"""
    history_file = 'data/history.json'
    
    # Ensure data directory exists
    os.makedirs('data', exist_ok=True)
    
    if request.method == 'GET':
        # Get reading history
        try:
            if os.path.exists(history_file):
                with open(history_file, 'r') as f:
                    history = json.load(f)
            else:
                history = []
            return jsonify(history)
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'POST':
        # Add to reading history
        try:
            data = request.get_json()
            
            # Load existing history
            if os.path.exists(history_file):
                with open(history_file, 'r') as f:
                    history = json.load(f)
            else:
                history = []
            
            # Add new entry
            new_entry = {
                'id': int(datetime.now().timestamp() * 1000),
                'name': data.get('name'),
                'size': data.get('size'),
                'date': datetime.now().strftime('%Y-%m-%d'),
                'time': datetime.now().strftime('%H:%M:%S')
            }
            
            # Remove existing entry with same name
            history = [item for item in history if item.get('name') != data.get('name')]
            
            # Add new entry at the beginning
            history.insert(0, new_entry)
            
            # Keep only last 20 items
            history = history[:20]
            
            # Save to file
            with open(history_file, 'w') as f:
                json.dump(history, f, indent=2)
            
            return jsonify({'message': 'History updated successfully'})
        
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'DELETE':
        # Clear reading history
        try:
            if os.path.exists(history_file):
                os.remove(history_file)
            return jsonify({'message': 'History cleared successfully'})
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("🚀 Starting PDF Reader Flask Server...")
    print("📖 PDF Reader available at: http://localhost:5000")
    print("🔧 API Health Check: http://localhost:5000/api/health")
    print("📊 Press Ctrl+C to stop the server")
    
    app.run(
        debug=True,
        host='127.0.0.1',  # Only localhost access
        port=5000,
        threaded=True
    )

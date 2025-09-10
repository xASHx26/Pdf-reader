#!/usr/bin/env python3

from flask import Flask, render_template, jsonify
import os

# Create a minimal Flask app for testing
app = Flask(__name__)

@app.route('/')
def home():
    return '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>PDF Reader - Vercel Test</title>
        <style>
            body { font-family: Arial; margin: 50px; text-align: center; }
            .container { max-width: 600px; margin: 0 auto; }
            .status { background: #e8f5e8; padding: 20px; border-radius: 10px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎉 PDF Reader on Vercel</h1>
            <div class="status">
                <h2>✅ Flask App is Working!</h2>
                <p>Your PDF Reader has been successfully deployed to Vercel.</p>
            </div>
            <p><a href="/test">Test Route</a> | <a href="/health">Health Check</a></p>
        </div>
    </body>
    </html>
    '''

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
        "files": os.listdir('.'),
        "python_version": "3.x",
        "flask_working": True
    })

# Vercel expects this specific pattern
app_instance = app

if __name__ == '__main__':
    app.run(debug=True)

# PDF Reader with Synchronized Audio - Flask Edition

A modern, responsive PDF reader web application with synchronized audio playback and line-by-line text highlighting. Built with Flask backend and vanilla JavaScript frontend.

## ✨ Key Features

### 📖 **PDF Reading**
- Upload and view PDF files locally
- Navigate through pages with Previous/Next buttons
- Zoom in/out functionality (50% to 300%)
- High-quality PDF rendering with PDF.js
- Responsive design for all devices

### 🎵 **Synchronized Audio Playback**
- Load and play audio files alongside PDFs
- **Real-time text highlighting** as audio plays
- **Line-by-line synchronization** with visual feedback
- **Adjustable reading speed** (100-300 WPM)
- **Enable/disable sync** toggle
- Standard audio controls (play, pause, stop, fast forward, rewind)
- Volume control and progress bar with seek functionality

### 📚 **Smart History Management**
- Automatically saves PDF reading history
- Server-side storage with local fallback
- Shows file name, size, date, and time
- Stores up to 20 recent files
- Clear history option
- No external server dependency required

### ⌨️ **Keyboard Shortcuts**
- `←` / `→` - Navigate pages
- `+` / `-` - Zoom in/out
- `Space` - Play/pause audio
- `Escape` - Close modals

## 🚀 **Technology Stack**

- **Backend**: Python Flask with Flask-CORS
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **PDF Rendering**: PDF.js library
- **Audio**: HTML5 Audio API with custom controls
- **Storage**: Server-side JSON + LocalStorage fallback
- **Styling**: Modern CSS with glassmorphism effects

## 🛠️ **Installation & Setup**

### Prerequisites
- Python 3.8+ installed
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Quick Start

1. **Navigate to project directory**
   ```bash
   cd "Pdf reader"
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the Flask server**
   ```bash
   python app.py
   ```
   
   Or use the convenient startup script:
   ```bash
   # Windows
   start.bat
   ```

4. **Open your browser**
   ```
   http://localhost:5000
   ```

## 📁 **Project Structure**

```
pdf-reader/
├── app.py                  # Flask application server
├── requirements.txt        # Python dependencies
├── start.bat              # Windows startup script
├── test_server.py         # Server testing script
├── templates/
│   └── index.html         # Main HTML template
├── static/
│   ├── styles.css         # Application styles
│   ├── script.js          # Main JavaScript functionality
│   ├── sw.js             # Service worker
│   └── favicon.ico       # Favicon
├── data/
│   └── history.json      # Reading history storage
├── uploads/               # PDF upload directory (optional)
└── README.md             # This file
```

## 🎯 **How to Use**

### Basic PDF Reading
1. Click **"Open PDF"** to select a PDF file
2. Use **Previous/Next** buttons or arrow keys to navigate
3. Use **+/-** buttons to zoom in/out
4. View your reading history by clicking **"History"**

### Synchronized Audio Reading
1. **Load a PDF** first using "Open PDF"
2. **Load an audio file** using "Load Audio File"
3. **Adjust reading speed** (WPM) to match your audio
4. **Enable sync** if not already enabled
5. **Press play** - watch text highlight as audio plays!

### Sync Controls
- **Enable Audio-Text Sync**: Toggle synchronization on/off
- **Reading Speed**: Adjust WPM (Words Per Minute) from 100-300
- **Real-time feedback**: See current WPM setting

## 🎨 **Visual Features**

### Text Highlighting System
- **Current word**: Yellow highlight with pulse animation
- **Current line**: Amber highlight with glow effect
- **Smooth transitions**: CSS animations for professional look
- **Auto-scroll**: Follows highlighting automatically

### Modern UI Design
- **Glassmorphism effects**: Translucent panels with blur
- **Gradient backgrounds**: Beautiful color transitions
- **Responsive layout**: Works on desktop, tablet, and mobile
- **Intuitive controls**: User-friendly interface design

## 🔧 **API Endpoints**

The Flask server provides these REST API endpoints:

### Health Check
```http
GET /api/health
```
Returns server status and timestamp

### History Management
```http
GET /api/history          # Get reading history
POST /api/history         # Add to history
DELETE /api/history       # Clear history
```

### Static Files
```http
GET /static/<filename>    # CSS, JS, and other assets
GET /sw.js               # Service worker
GET /favicon.ico         # Favicon
```

## 🧪 **Testing**

Run the comprehensive test suite:

```bash
python test_server.py
```

This tests:
- ✅ Server connectivity
- ✅ All API endpoints
- ✅ Static file serving
- ✅ Error handling

## 🔧 **Configuration**

### Reading Speed
Default: 150 WPM (adjustable from 100-300)

### History Limit
Default: 20 items (configurable in JavaScript)

### Server Settings
- **Host**: 0.0.0.0 (accessible from network)
- **Port**: 5000
- **Debug**: Enabled in development

## 🚀 **Deployment Options**

### Local Development
```bash
python app.py
```

### Production (with Gunicorn)
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Docker (optional)
Create a `Dockerfile` for containerized deployment.

## 🔒 **Privacy & Security**

- ✅ **No external tracking**: All data processed locally
- ✅ **Local file processing**: PDFs never leave your device
- ✅ **Optional server storage**: History can be local-only
- ✅ **CORS enabled**: Secure cross-origin requests
- ✅ **No data collection**: Privacy-focused design

## 🐛 **Troubleshooting**

### Common Issues

**Server won't start**
- Check if port 5000 is available
- Ensure Python 3.8+ is installed
- Verify virtual environment is activated

**PDF won't load**
- Ensure PDF file is not corrupted
- Check browser console for errors
- Try a different PDF file

**Audio sync not working**
- Verify audio file format is supported (MP3, WAV, OGG)
- Check if sync is enabled in controls
- Adjust reading speed to match audio

**History not saving**
- Check if `data/` directory exists
- Verify write permissions
- Check browser console for API errors

### Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 **License**

MIT License - feel free to use this project for personal or commercial purposes.

## 🆘 **Support**

For issues or questions:
1. Check the browser console for errors
2. Run `python test_server.py` to verify setup
3. Ensure your browser supports PDF.js and HTML5 audio
4. Check this README for troubleshooting tips

## 🔮 **Future Enhancements**

- [ ] **Text search** within PDFs
- [ ] **Bookmarks/annotations** system
- [ ] **Multiple PDF tabs** support
- [ ] **Audio speed control** (playback rate)
- [ ] **Dark mode** theme
- [ ] **PDF download** option
- [ ] **Print functionality**
- [ ] **Mobile app** version
- [ ] **Cloud storage** integration
- [ ] **Multi-language** support

---

## 🎉 **Enjoy Your Synchronized Reading Experience!**

This application combines the best of PDF reading with synchronized audio playback, making it perfect for:
- 📚 **Educational content**
- 🎧 **Audiobook reading**
- 🗣️ **Language learning**
- ♿ **Accessibility support**
- 🎭 **Presentation reading**

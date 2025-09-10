// Simple test script
console.log('🚀 PDF Reader Script Loading...');

// Test functions
window.testFileInput = function() {
    console.log('=== MANUAL FILE INPUT TEST ===');
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
        console.log('File input found, triggering click...');
        fileInput.click();
    } else {
        console.error('File input not found!');
    }
};

window.testButton = function() {
    const btn = document.getElementById('openPdfBtn');
    if (btn) {
        btn.style.backgroundColor = 'red';
        console.log('Button found and styled red');
    } else {
        console.error('Button not found!');
    }
};

// PDF.js worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Global variables
let currentZoom = 1.5;
let isTextView = false;
let isReading = false;
let isPaused = false;
let currentSentenceIndex = 0;
let sentences = [];

// 📁 Local Storage Configuration
const LOCAL_STORAGE_CONFIG = {
    enabled: true,
    basePath: 'C:/pdfs/',
    maxRetries: 2,
    retryDelay: 1000
};

// 📁 Local Storage Helper Functions
async function checkLocalStorageFile(fileName) {
    if (!LOCAL_STORAGE_CONFIG.enabled || !fileName) return null;
    
    try {
        const filePath = LOCAL_STORAGE_CONFIG.basePath + fileName;
        console.log('🔍 Checking local storage for:', filePath);
        
        // Try to fetch the file from local storage path
        const response = await fetch(`file:///${filePath.replace(/\\/g, '/')}`);
        if (response.ok) {
            console.log('✅ Found file in local storage:', fileName);
            return await response.arrayBuffer();
        }
    } catch (error) {
        console.log('💾 File not found in local storage:', fileName);
    }
    
    return null;
}

function showLocalStorageMessage(fileName) {
    const message = `
📁 Local Storage Setup Recommended

For faster loading, consider placing your PDFs in:
C:/pdfs/

Create this folder structure:
C:/
└── pdfs/
    ├── ${fileName}
    └── your-other-pdfs.pdf

Benefits:
🚀 Faster loading from history
💾 No server storage needed  
🔒 Your files stay private
📱 Works offline

This is optional - the app works without it!
    `;
    
    console.log(message);
    
    // Create a subtle notification instead of alert
    createLocalStorageNotification();
}

function createLocalStorageNotification() {
    // Remove existing notification if any
    const existing = document.getElementById('local-storage-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.id = 'local-storage-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(45deg, #4CAF50, #45a049);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        max-width: 350px;
        font-size: 14px;
        line-height: 1.4;
        cursor: pointer;
        transition: all 0.3s ease;
    `;
    
    notification.innerHTML = `
        <strong>📁 Local Storage Available</strong><br>
        Place PDFs in C:/PDFReader/PDFs/ for faster loading!<br>
        <small style="opacity: 0.8;">Click to dismiss</small>
    `;
    
    notification.onclick = () => notification.remove();
    
    document.body.appendChild(notification);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }
    }, 8000);
}

// 📁 Directory Setup Guide Function
window.showDirectorySetupGuide = function() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
        animation: fadeIn 0.3s ease;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        border-radius: 15px;
        padding: 30px;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        position: relative;
    `;
    
    content.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #4a5568; margin: 0 0 10px 0;">📁 Local Storage Setup Guide</h2>
            <p style="color: #666; margin: 0;">Optional setup for faster PDF loading</p>
        </div>
        
        <div style="background: #f7fafc; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #2d3748; margin: 0 0 15px 0;">Recommended Folder Structure:</h3>
            <pre style="background: #edf2f7; padding: 15px; border-radius: 8px; margin: 0; font-size: 14px; overflow-x: auto;">C:/
└── pdfs/
    ├── your-document1.pdf
    ├── your-document2.pdf
    ├── research-paper.pdf
    └── manual.pdf</pre>
        </div>
        
        <div style="margin: 20px 0;">
            <h3 style="color: #2d3748; margin: 0 0 15px 0;">🚀 Benefits:</h3>
            <ul style="color: #4a5568; line-height: 1.6; padding-left: 20px;">
                <li><strong>⚡ Faster loading:</strong> Files load instantly from local storage</li>
                <li><strong>💾 No server storage:</strong> Everything stays on your computer</li>
                <li><strong>🔒 Privacy:</strong> Your files never leave your device</li>
                <li><strong>📱 Offline access:</strong> Works without internet connection</li>
                <li><strong>🎯 Smart history:</strong> Resume reading where you left off</li>
            </ul>
        </div>
        
        <div style="background: #e6fffa; border-left: 4px solid #38b2ac; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #2d3748; font-size: 14px;">
                <strong>💡 Note:</strong> This is completely optional! The app works perfectly without local storage - 
                this just makes loading faster if you frequently use the same PDFs.
            </p>
        </div>
        
        <div style="text-align: center; margin-top: 25px;">
            <button onclick="this.closest('.modal-overlay').remove()" style="
                background: linear-gradient(45deg, #667eea, #764ba2);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
            ">Got it!</button>
        </div>
    `;
    
    modal.className = 'modal-overlay';
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Add fade in animation CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
};

// Global cleanup function
function cleanupPreviousSession() {
    console.log('🧹 Cleaning up previous PDF session...');
    
    // Reset view state
    isTextView = false;
    
    // Reset zoom
    currentZoom = 1.5;
    if (typeof updateZoomDisplay === 'function') {
        updateZoomDisplay();
    }
    
    // Remove any existing toggle buttons
    const existingToggleButtons = document.querySelectorAll('.view-toggle-btn');
    existingToggleButtons.forEach(btn => btn.remove());
    
    // Clear text layer
    const textLayer = document.getElementById('text-layer');
    if (textLayer) {
        textLayer.innerHTML = '';
        textLayer.style.display = 'none';
    }
    
    // Clear canvas
    const canvas = document.getElementById('pdf-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.display = 'block';
    }
    
    // Reset TTS state
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }
    isReading = false;
    isPaused = false;
    currentSentenceIndex = 0;
    sentences = [];
    
    // Reset progress
    if (typeof updateTitleProgress === 'function') {
        updateTitleProgress(0);
    }
    if (typeof updateReadingProgress === 'function') {
        updateReadingProgress(0);
    }
    
    // Reset current sentence display
    const sentenceInfo = document.getElementById('currentSentence');
    if (sentenceInfo) {
        sentenceInfo.textContent = 'No text loaded';
    }
    
    console.log('✅ Cleanup completed');
}

// 📁 Load PDF from local storage function
async function loadFromLocalStorage(fileName, historyIndex) {
    try {
        console.log('⚡ Loading from local storage:', fileName);
        
        // Close history modal
        const historyModal = document.getElementById('historyModal');
        if (historyModal) {
            historyModal.style.display = 'none';
        }
        
        // Check if file exists in local storage
        const localStorageBuffer = await checkLocalStorageFile(fileName);
        
        if (localStorageBuffer) {
            // Clean up previous session
            cleanupPreviousSession();
            
            // Hide welcome message and show PDF container
            const welcomeMessage = document.querySelector('.welcome-message');
            const pdfContainer = document.getElementById('pdf-container');
            
            if (welcomeMessage) {
                welcomeMessage.style.display = 'none';
            }
            
            if (pdfContainer) {
                pdfContainer.classList.remove('hidden');
                pdfContainer.style.display = 'block';
            }
            
            // Load PDF with PDF.js
            const pdf = await pdfjsLib.getDocument(localStorageBuffer).promise;
            const page = await pdf.getPage(1);
            const canvas = document.getElementById('pdf-canvas');
            const ctx = canvas.getContext('2d');
            
            // Set up viewport and render
            const viewport = page.getViewport({ scale: currentZoom });
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            
            await page.render({
                canvasContext: ctx,
                viewport: viewport
            }).promise;
            
            // Extract text for TTS
            const textContent = await page.getTextContent();
            const textItems = textContent.items.map((item, index) => ({
                text: item.str,
                x: item.transform[4],
                y: item.transform[5],
                width: item.width || (item.str.length * 8),
                height: item.height || 12,
                fontSize: item.transform[0] || 12,
                index: index
            }));
            
            const fullText = textItems.map(item => item.text).join('');
            
            // Store references
            window.currentPDF = {
                canvas: canvas,
                textItems: textItems,
                fullText: fullText,
                page: page
            };
            
            // Initialize TTS
            if (fullText.trim()) {
                initializeTTS(fullText, textItems, canvas);
            }
            
            // Initialize zoom controls
            initializeZoomControls();
            
            console.log('✅ PDF loaded from local storage successfully');
            
        } else {
            alert(`File "${fileName}" not found in C:/pdfs/ folder. Please place the file there for fast loading.`);
        }
        
    } catch (error) {
        console.error('❌ Error loading from local storage:', error);
        alert('Error loading from local storage: ' + error.message);
    }
}

// Simple initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 DOM Content Loaded - Starting Initialization');
    
    // Find elements
    const fileInput = document.getElementById('file-input');
    const openPdfBtn = document.getElementById('openPdfBtn');
    const historyBtn = document.getElementById('historyBtn');
    
    console.log('🔍 Elements Check:', {
        fileInput: !!fileInput,
        openPdfBtn: !!openPdfBtn,
        historyBtn: !!historyBtn
    });
    
    // Style the button to show script is working
    if (openPdfBtn) {
        openPdfBtn.style.backgroundColor = '#28a745';
        openPdfBtn.style.color = 'white';
        openPdfBtn.style.border = '2px solid #1e7e34';
        console.log('✅ Button styled - JavaScript is working!');
        
        // Add click handler
        openPdfBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🖱️ BUTTON CLICKED!');
            
            if (fileInput) {
                console.log('📁 Triggering file input...');
                fileInput.click();
            } else {
                console.error('❌ File input not found');
            }
        });
        
        console.log('✅ Click handler added');
    } else {
        console.error('❌ Open PDF button not found!');
    }
    
    // Add file input handler
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            console.log('📋 FILE SELECTED:', e.target.files.length);
            const file = e.target.files[0];
            if (file) {
                console.log('📄 File details:', {
                    name: file.name,
                    type: file.type,
                    size: file.size
                });
                
                if (file.type === 'application/pdf') {
                    console.log('✅ Valid PDF file detected');
                    // Instead of alert, actually load the PDF
                    loadPDFFile(file);
                } else {
                    console.log('❌ Invalid file type');
                    alert('Please select a PDF file');
                }
                
                // Reset file input to allow selecting the same file again
                fileInput.value = '';
            }
        });
        console.log('✅ File input handler added');
    }
    
    // Add history button handler
    if (historyBtn) {
        historyBtn.addEventListener('click', function() {
            console.log('📚 History button clicked');
            loadAndShowHistory();
        });
        console.log('✅ History button handler added');
    }
    
    // Add history modal close handlers
    setupHistoryModalHandlers();
    
    console.log('🎉 Initialization Complete!');
});

// PDF Loading Function  
async function loadPDFFile(file) {
    try {
        console.log('📖 Loading PDF:', file.name);
        
        // Clean up previous PDF session
        cleanupPreviousSession();
        
        // Hide welcome message and show PDF container
        const welcomeMessage = document.querySelector('.welcome-message');
        const pdfContainer = document.getElementById('pdf-container');
        
        if (welcomeMessage) {
            welcomeMessage.style.display = 'none';
            console.log('✅ Welcome message hidden');
        }
        
        if (pdfContainer) {
            pdfContainer.classList.remove('hidden');
            pdfContainer.style.display = 'block';
            console.log('✅ PDF container shown');
        }

        let arrayBuffer;
        let loadedFromLocalStorage = false;

        // 📁 Try to load from local storage first
        console.log('🔍 Checking local storage for faster loading...');
        const localStorageBuffer = await checkLocalStorageFile(file.name);
        
        if (localStorageBuffer) {
            arrayBuffer = localStorageBuffer;
            loadedFromLocalStorage = true;
            console.log('⚡ Loaded from local storage - faster loading!');
        } else {
            // Convert file to array buffer (slower method)
            console.log('🔄 Converting file to array buffer...');
            arrayBuffer = await file.arrayBuffer();
            
            // Show local storage suggestion (only once per session)
            if (!sessionStorage.getItem('localStorageShown')) {
                showLocalStorageMessage(file.name);
                sessionStorage.setItem('localStorageShown', 'true');
            }
        }
        
        // Load PDF with PDF.js
        console.log('📚 Loading PDF with PDF.js...');
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        console.log('✅ PDF loaded successfully! Pages:', pdf.numPages);
        console.log('📊 Load method:', loadedFromLocalStorage ? 'Local Storage (Fast)' : 'File Input (Standard)');
        
        // Get first page
        const page = await pdf.getPage(1);
        const canvas = document.getElementById('pdf-canvas');
        const ctx = canvas.getContext('2d');
        
        // Set up viewport and render with current zoom
        const viewport = page.getViewport({ scale: currentZoom });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        console.log('🎨 Rendering PDF page...');
        await page.render({
            canvasContext: ctx,
            viewport: viewport
        }).promise;
        
        console.log('✅ PDF rendered successfully!');
        
        // Extract text for TTS with line positions
        console.log('📝 Extracting text with positions...');
        const textContent = await page.getTextContent();
        
        // Create text items with position data for highlighting
        const textItems = textContent.items.map((item, index) => ({
            text: item.str,
            x: item.transform[4],
            y: item.transform[5],
            width: item.width || (item.str.length * 8), // Estimate width if not provided
            height: item.height || 12, // Default height
            fontSize: item.transform[0] || 12, // Font size from transform matrix
            index: index
        }));
        
        // Build full text while preserving character positions  
        const fullText = textItems.map(item => item.text).join('');
        console.log('✅ Text extracted with positions, length:', fullText.length);
        console.log('📊 Text items count:', textItems.length);
        
        // Store references for both views
        window.currentPDF = {
            canvas: canvas,
            textItems: textItems,
            fullText: fullText,
            page: page
        };
        
        // Initialize TTS with extracted text and positions
        if (fullText.trim()) {
            initializeTTS(fullText, textItems, canvas);
        }
        
        // Initialize zoom controls
        initializeZoomControls();
        
        // Save to history with load status information
        await saveToHistory(file.name, file.size, file, loadedFromLocalStorage);
        
    } catch (error) {
        console.error('❌ Error loading PDF:', error);
        alert('Error loading PDF: ' + error.message);
    }
}

// Zoom functionality for PDF viewer
function initializeZoomControls() {
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const zoomLevel = document.getElementById('zoom-level');
    
    if (zoomInBtn && zoomOutBtn && zoomLevel) {
        zoomInBtn.addEventListener('click', () => zoomPDF(0.1));
        zoomOutBtn.addEventListener('click', () => zoomPDF(-0.1));
        
        // Update zoom level display
        updateZoomDisplay();
        console.log('✅ Zoom controls initialized');
    }
}

function zoomPDF(delta) {
    if (!window.currentPDF) return;
    
    // Update zoom level with finer control (min 0.5x, max 2.0x)
    const newZoom = Math.max(0.5, Math.min(2.0, currentZoom + delta));
    
    // Only update if there's a meaningful change
    if (Math.abs(newZoom - currentZoom) > 0.05) {
        currentZoom = newZoom;
        
        // Re-render PDF with new zoom
        renderPDFAtZoom();
        updateZoomDisplay();
        
        console.log('🔍 Zoom changed to:', Math.round(currentZoom * 100) + '%');
    }
}

async function renderPDFAtZoom() {
    if (!window.currentPDF) return;
    
    try {
        const { page, canvas } = window.currentPDF;
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set up viewport with zoom
        const viewport = page.getViewport({ scale: currentZoom });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        // Re-render the page
        await page.render({
            canvasContext: ctx,
            viewport: viewport
        }).promise;
        
        // Update highlight canvas if it exists
        const highlightCanvas = document.getElementById('highlight-canvas');
        if (highlightCanvas) {
            highlightCanvas.width = viewport.width;
            highlightCanvas.height = viewport.height;
        }
        
        console.log('✅ PDF re-rendered at zoom:', Math.round(currentZoom * 100) + '%');
        
    } catch (error) {
        console.error('❌ Error re-rendering PDF at zoom:', error);
    }
}

function updateZoomDisplay() {
    const zoomLevel = document.getElementById('zoom-level');
    if (zoomLevel) {
        zoomLevel.textContent = Math.round(currentZoom * 100) + '%';
    }
}

// Load PDF from server URL
async function loadPDFFromURL(url, fileName) {
    try {
        console.log('📥 Loading PDF from server:', url);
        
        // Hide welcome message and show PDF container
        const welcomeMessage = document.querySelector('.welcome-message');
        const pdfContainer = document.getElementById('pdf-container');
        
        if (welcomeMessage) {
            welcomeMessage.style.display = 'none';
            console.log('✅ Welcome message hidden');
        }
        
        if (pdfContainer) {
            pdfContainer.classList.remove('hidden');
            pdfContainer.style.display = 'block';
            console.log('✅ PDF container shown');
        }
        
        // Fetch PDF from server
        console.log('🔄 Fetching PDF from server...');
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch PDF: ${response.status}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        
        // Load PDF with PDF.js
        console.log('📚 Loading PDF with PDF.js...');
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        console.log('✅ PDF loaded successfully! Pages:', pdf.numPages);
        
        // Get first page
        const page = await pdf.getPage(1);
        const canvas = document.getElementById('pdf-canvas');
        const ctx = canvas.getContext('2d');
        
        // Set up viewport and render
        const viewport = page.getViewport({ scale: 1.0 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        console.log('🎨 Rendering PDF page...');
        await page.render({
            canvasContext: ctx,
            viewport: viewport
        }).promise;
        
        console.log('✅ PDF rendered successfully!');
        
        // Extract text for TTS with line positions
        console.log('📝 Extracting text with positions...');
        const textContent = await page.getTextContent();
        
        // Create text items with position data for highlighting
        const textItems = textContent.items.map((item, index) => ({
            text: item.str,
            x: item.transform[4],
            y: item.transform[5],
            width: item.width || (item.str.length * 8), // Estimate width if not provided
            height: item.height || 12, // Default height
            fontSize: item.transform[0] || 12, // Font size from transform matrix
            index: index
        }));
        
        // Build full text while preserving character positions  
        const fullText = textItems.map(item => item.text).join('');
        console.log('✅ Text extracted with positions, length:', fullText.length);
        console.log('📊 Text items count:', textItems.length);
        
        // Store references for both views
        window.currentPDF = {
            canvas: canvas,
            textItems: textItems,
            fullText: fullText,
            page: page
        };
        
        // Initialize TTS with extracted text and positions
        if (fullText.trim()) {
            initializeTTS(fullText, textItems, canvas);
        }
        
        // Initialize zoom controls
        initializeZoomControls();
        
        console.log('✅ PDF loaded from server successfully:', fileName);
        
    } catch (error) {
        console.error('❌ Error loading PDF from server:', error);
        alert('Error loading PDF from server: ' + error.message);
    }
}

// Enhanced TTS initialization with dual view support
function initializeTTS(text, textItems, canvas) {
    console.log('🎤 Initializing enhanced TTS with text length:', text.length);
    
    // Split text into sentences with better parsing
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    console.log('📋 Sentences found:', sentences.length);
    
    let currentSentenceIndex = 0;
    let currentUtterance = null;
    let estimatedTimePerSentence = 4; // seconds per sentence estimate
    
    // Create both views
    createTextOverlay(textItems, canvas, sentences);
    createCanvasHighlight(canvas, textItems, sentences);
    
    // Add view toggle button
    addViewToggleButton();
    
    // Update the "No text loaded" message and add remaining time
    const currentSentenceDisplay = document.getElementById('currentSentence');
    if (currentSentenceDisplay) {
        updateCurrentSentenceDisplay();
    }
    
    // Initialize voice controls with real-time updates
    initializeVoiceControls();
    
    // Get TTS control buttons
    const readBtn = document.getElementById('readBtn');
    const pauseBtn = document.getElementById('pauseReadBtn');
    const stopBtn = document.getElementById('stopReadBtn');
    const nextBtn = document.getElementById('nextSentenceBtn');
    const prevBtn = document.getElementById('prevSentenceBtn');
    
    console.log('🎛️ TTS buttons found:', {
        read: !!readBtn,
        pause: !!pauseBtn,
        stop: !!stopBtn,
        next: !!nextBtn,
        prev: !!prevBtn
    });
    
    // Start Reading button
    if (readBtn) {
        readBtn.addEventListener('click', () => {
            console.log('▶️ Start reading clicked');
            if (sentences.length > 0 && !isReading) {
                isReading = true;
                isPaused = false;
                updateButtonStates();
                speakSentence(sentences[currentSentenceIndex]);
                updateCurrentSentenceDisplay();
            }
        });
    }
    
    // Enhanced Pause/Resume button
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            console.log('⏸️ Pause/Resume clicked');
            if (isReading) {
                if (isPaused) {
                    // Resume
                    speechSynthesis.resume();
                    isPaused = false;
                    console.log('▶️ Resumed reading');
                } else {
                    // Pause
                    speechSynthesis.pause();
                    isPaused = true;
                    console.log('⏸️ Paused reading');
                }
                updateButtonStates();
            }
        });
    }
    
    // Stop Reading button
    if (stopBtn) {
        stopBtn.addEventListener('click', () => {
            console.log('⏹️ Stop reading clicked');
            speechSynthesis.cancel();
            isReading = false;
            isPaused = false;
            currentSentenceIndex = 0;
            clearAllHighlights();
            updateCurrentSentenceDisplay();
            updateButtonStates();
        });
    }
    
    // Next Sentence button
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentSentenceIndex < sentences.length - 1) {
                currentSentenceIndex++;
                updateCurrentSentenceDisplay();
                if (isReading) {
                    speechSynthesis.cancel();
                    speakSentence(sentences[currentSentenceIndex]);
                }
            }
        });
    }
    
    // Previous Sentence button
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentSentenceIndex > 0) {
                currentSentenceIndex--;
                updateCurrentSentenceDisplay();
                if (isReading) {
                    speechSynthesis.cancel();
                    speakSentence(sentences[currentSentenceIndex]);
                }
            }
        });
    }
    
    // Store TTS instance globally for real-time control access
    window.currentTTSInstance = {
        sentences: sentences,
        currentSentenceIndex: currentSentenceIndex,
        isReading: isReading,
        isPaused: isPaused,
        speakSentence: speakSentence
    };
    
    function speakSentence(sentence) {
        const utterance = new SpeechSynthesisUtterance(sentence);
        currentUtterance = utterance;
        window.currentUtterance = utterance;
        
        // Apply voice settings in real-time
        applyVoiceSettings(utterance);
        
        // Highlight current sentence in both views
        highlightSentence(currentSentenceIndex);
        
        utterance.onend = () => {
            if (isReading && !isPaused && currentSentenceIndex < sentences.length - 1) {
                currentSentenceIndex++;
                window.currentTTSInstance.currentSentenceIndex = currentSentenceIndex;
                updateCurrentSentenceDisplay();
                setTimeout(() => speakSentence(sentences[currentSentenceIndex]), 300);
            } else if (currentSentenceIndex >= sentences.length - 1) {
                // Reading completed
                isReading = false;
                isPaused = false;
                window.currentTTSInstance.isReading = false;
                window.currentTTSInstance.isPaused = false;
                clearAllHighlights();
                updateCurrentSentenceDisplay();
                updateButtonStates();
                console.log('✅ Reading completed!');
            }
        };
        
        utterance.onerror = (event) => {
            console.error('❌ Speech error:', event.error);
        };
        
        speechSynthesis.speak(utterance);
        console.log('🗣️ Speaking sentence', currentSentenceIndex + 1, ':', sentence.substring(0, 50) + '...');
    }
    
    function applyVoiceSettings(utterance) {
        const speedRange = document.getElementById('speechRate');
        const pitchRange = document.getElementById('speechPitch');
        const volumeRange = document.getElementById('speechVolume');
        const voiceSelect = document.getElementById('voiceSelect');
        
        if (speedRange) {
            utterance.rate = parseFloat(speedRange.value);
        }
        if (pitchRange) {
            utterance.pitch = parseFloat(pitchRange.value);
        }
        if (volumeRange) {
            utterance.volume = parseFloat(volumeRange.value);
        }
        if (voiceSelect && voiceSelect.selectedIndex > 0) {
            const voices = speechSynthesis.getVoices();
            utterance.voice = voices[voiceSelect.selectedIndex - 1];
        }
    }
    
    function updateCurrentSentenceDisplay() {
        if (currentSentenceDisplay) {
            const remainingSentences = sentences.length - currentSentenceIndex;
            const estimatedTimeRemaining = remainingSentences * estimatedTimePerSentence;
            const minutes = Math.floor(estimatedTimeRemaining / 60);
            const seconds = estimatedTimeRemaining % 60;
            
            const timeText = minutes > 0 ? 
                `${minutes}m ${seconds}s remaining` : 
                `${seconds}s remaining`;
            
            const statusText = isReading ? 
                (isPaused ? '⏸️ Paused' : '▶️ Reading') : 
                '⏹️ Stopped';
            
            currentSentenceDisplay.innerHTML = `
                <div>Sentence ${currentSentenceIndex + 1} of ${sentences.length}</div>
                <div style="font-size: 12px; color: #666; margin-top: 4px;">
                    ${statusText} • ${timeText}
                </div>
            `;
        }
        
        const progress = document.getElementById('readingProgressBar');
        if (progress) {
            const percent = ((currentSentenceIndex + 1) / sentences.length) * 100;
            progress.style.width = percent + '%';
        }
        
        // Update title progress bar and percentage
        const titleProgressFill = document.getElementById('titleProgressFill');
        const titlePercentage = document.getElementById('titlePercentage');
        if (titleProgressFill && titlePercentage && sentences.length > 0) {
            const percent = Math.round(((currentSentenceIndex + 1) / sentences.length) * 100);
            titleProgressFill.style.width = percent + '%';
            titlePercentage.textContent = percent + '%';
        }
    }
    
    function updateButtonStates() {
        if (readBtn) {
            readBtn.disabled = isReading && !isPaused;
            readBtn.style.opacity = readBtn.disabled ? '0.5' : '1';
        }
        if (pauseBtn) {
            pauseBtn.textContent = isPaused ? '▶️ Resume' : '⏸️ Pause';
            pauseBtn.disabled = !isReading;
            pauseBtn.style.opacity = pauseBtn.disabled ? '0.5' : '1';
        }
    }
    
    function highlightSentence(sentenceIndex) {
        // Clear previous highlights
        clearAllHighlights();
        
        if (isTextView) {
            // Highlight in text view
            const sentenceElements = document.querySelectorAll('.text-sentence');
            if (sentenceElements[sentenceIndex]) {
                sentenceElements[sentenceIndex].classList.add('highlighted');
                sentenceElements[sentenceIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            // Highlight on PDF canvas
            highlightOnCanvas(sentenceIndex);
        }
    }
    
    function clearAllHighlights() {
        // Clear text view highlights
        const highlighted = document.querySelectorAll('.highlighted');
        highlighted.forEach(el => el.classList.remove('highlighted'));
        
        // Clear canvas highlights
        clearCanvasHighlight();
    }
    
    function addViewToggleButton() {
        // Check if button already exists
        const existingToggleBtn = document.querySelector('.view-toggle-btn');
        if (existingToggleBtn) {
            console.log('Toggle button already exists, skipping creation');
            return;
        }
        
        // Place the button in the header controls area
        const headerControls = document.querySelector('.header-controls');
        if (headerControls) {
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'view-toggle-btn btn btn-secondary';
            toggleBtn.innerHTML = '🔄 Text View';
            toggleBtn.style.cssText = `
                padding: 8px 16px;
                background: #4a90e2;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                transition: all 0.3s ease;
            `;
            
            toggleBtn.addEventListener('click', () => {
                toggleView();
                toggleBtn.innerHTML = isTextView ? 
                    '🔄 PDF View' : 
                    '🔄 Text View';
            });
            
            toggleBtn.addEventListener('mouseover', () => {
                toggleBtn.style.transform = 'translateY(-2px)';
                toggleBtn.style.boxShadow = '0 5px 15px rgba(74, 144, 226, 0.4)';
            });
            
            toggleBtn.addEventListener('mouseout', () => {
                toggleBtn.style.transform = 'translateY(0)';
                toggleBtn.style.boxShadow = 'none';
            });
            
            // Insert the button in the header controls
            headerControls.appendChild(toggleBtn);
        }
    }
    
    function toggleView() {
        const canvas = document.getElementById('pdf-canvas');
        const textLayer = document.getElementById('text-layer');
        
        isTextView = !isTextView;
        
        if (isTextView) {
            // Show text view
            if (canvas) canvas.style.display = 'none';
            if (textLayer) textLayer.style.display = 'block';
            console.log('📝 Switched to text view');
        } else {
            // Show PDF view
            if (canvas) canvas.style.display = 'block';
            if (textLayer) textLayer.style.display = 'none';
            console.log('📄 Switched to PDF view');
        }
        
        // Re-highlight current sentence in new view
        if (isReading) {
            highlightSentence(currentSentenceIndex);
        }
    }
    
    // Function to jump to specific sentence when clicked (text view)
    window.jumpToSentence = function(sentenceIndex) {
        console.log('🎯 Jumping to sentence:', sentenceIndex + 1);
        currentSentenceIndex = sentenceIndex;
        updateCurrentSentenceDisplay();
        
        if (isReading) {
            speechSynthesis.cancel();
            speakSentence(sentences[currentSentenceIndex]);
        } else {
            highlightSentence(currentSentenceIndex);
        }
    };
    
    // Initialize display and button states
    updateCurrentSentenceDisplay();
    updateButtonStates();
    
    // Start with PDF view
    toggleView();
    toggleView(); // This will set it back to PDF view as default
    
    console.log('✅ Enhanced TTS initialized successfully!');
}

// Create clickable text overlay for highlighting
function createTextOverlay(textItems, canvas, sentences) {
    console.log('🎨 Creating text overlay...');
    
    const textLayer = document.getElementById('text-layer');
    if (!textLayer) {
        console.error('❌ Text layer not found');
        return;
    }
    
    // Clear existing text layer
    textLayer.innerHTML = '';
    
    // Group text items by approximate lines (Y position)
    const lines = {};
    textItems.forEach(item => {
        const lineKey = Math.round(item.y / 5) * 5; // Group by 5px intervals
        if (!lines[lineKey]) lines[lineKey] = [];
        lines[lineKey].push(item);
    });
    
    // Sort lines by Y position (top to bottom)
    const sortedLines = Object.keys(lines)
        .sort((a, b) => parseFloat(b) - parseFloat(a))
        .map(key => lines[key]);
    
    // Create clickable sentence elements
    let sentenceIndex = 0;
    let currentSentenceText = '';
    
    sentences.forEach((sentence, index) => {
        const sentenceDiv = document.createElement('div');
        sentenceDiv.className = 'text-sentence';
        sentenceDiv.textContent = sentence.trim();
        sentenceDiv.style.cssText = `
            padding: 8px;
            margin: 4px 0;
            cursor: pointer;
            border-radius: 4px;
            transition: background-color 0.3s ease;
            line-height: 1.6;
            font-size: 14px;
        `;
        
        // Add click handler to jump to sentence
        sentenceDiv.addEventListener('click', () => {
            console.log('📍 Sentence clicked:', index + 1);
            window.jumpToSentence(index);
        });
        
        // Add hover effect
        sentenceDiv.addEventListener('mouseenter', () => {
            sentenceDiv.style.backgroundColor = 'rgba(74, 144, 226, 0.1)';
        });
        
        sentenceDiv.addEventListener('mouseleave', () => {
            if (!sentenceDiv.classList.contains('highlighted')) {
                sentenceDiv.style.backgroundColor = 'transparent';
            }
        });
        
        textLayer.appendChild(sentenceDiv);
    });
    
    console.log('✅ Text overlay created with', sentences.length, 'clickable sentences');
}

// Create canvas highlighting overlay for PDF view
function createCanvasHighlight(canvas, textItems, sentences) {
    console.log('🎨 Setting up canvas highlighting...');
    
    // Create a highlight canvas overlay
    const highlightCanvas = document.createElement('canvas');
    highlightCanvas.id = 'highlight-canvas';
    highlightCanvas.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: none;
        z-index: 5;
    `;
    
    // Match the PDF canvas dimensions
    highlightCanvas.width = canvas.width;
    highlightCanvas.height = canvas.height;
    
    // Insert after the main canvas
    canvas.parentNode.insertBefore(highlightCanvas, canvas.nextSibling);
    
    console.log('✅ Canvas highlighting setup complete');
}

// Highlight sentence on PDF canvas
function highlightOnCanvas(sentenceIndex) {
    const highlightCanvas = document.getElementById('highlight-canvas');
    if (!highlightCanvas || !window.currentPDF) return;
    
    const ctx = highlightCanvas.getContext('2d');
    ctx.clearRect(0, 0, highlightCanvas.width, highlightCanvas.height);
    
    // Get the sentence text to highlight
    const sentences = window.currentPDF.fullText.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const targetSentence = sentences[sentenceIndex];
    
    if (!targetSentence) return;
    
    console.log('🎯 Highlighting sentence:', sentenceIndex + 1, 'Text:', targetSentence.substring(0, 50) + '...');
    
    // Find the position of this sentence in the full text
    const fullText = window.currentPDF.fullText;
    const sentenceStart = fullText.indexOf(targetSentence.trim());
    
    if (sentenceStart === -1) {
        console.log('⚠️ Sentence not found in full text');
        return;
    }
    
    const sentenceEnd = sentenceStart + targetSentence.trim().length;
    
    // Build character-to-position mapping
    let charIndex = 0;
    const matchingItems = [];
    
    window.currentPDF.textItems.forEach(item => {
        const itemText = item.text;
        const itemStart = charIndex;
        const itemEnd = charIndex + itemText.length;
        
        // Check if this text item overlaps with our target sentence
        if (itemStart < sentenceEnd && itemEnd > sentenceStart) {
            matchingItems.push(item);
        }
        
        charIndex += itemText.length;
    });
    
    // Draw yellow highlight rectangles for matching items
    ctx.fillStyle = 'rgba(255, 255, 0, 0.6)';
    ctx.strokeStyle = 'rgba(255, 200, 0, 0.8)';
    ctx.lineWidth = 1;
    
    matchingItems.forEach(item => {
        // Convert PDF coordinates to canvas coordinates
        const x = item.x;
        const y = highlightCanvas.height - item.y - item.height; // Flip Y coordinate
        const width = item.width || 50; // Default width if not specified
        const height = item.height || 12; // Default height if not specified
        
        // Draw highlight rectangle
        ctx.fillRect(x - 1, y - 1, width + 2, height + 2);
        ctx.strokeRect(x - 1, y - 1, width + 2, height + 2);
    });
    
    console.log('✅ Highlighted', matchingItems.length, 'text items for sentence', sentenceIndex + 1);
}

// Clear canvas highlights
function clearCanvasHighlight() {
    const highlightCanvas = document.getElementById('highlight-canvas');
    if (highlightCanvas) {
        const ctx = highlightCanvas.getContext('2d');
        ctx.clearRect(0, 0, highlightCanvas.width, highlightCanvas.height);
    }
}

// Initialize voice controls with real-time feedback and updates
function initializeVoiceControls() {
    console.log('🎛️ Initializing enhanced voice controls...');
    
    // Speed control with real-time updates
    const speedRange = document.getElementById('speechRate');
    const speedDisplay = document.getElementById('speedDisplay');
    if (speedRange && speedDisplay) {
        speedRange.addEventListener('input', () => {
            const value = parseFloat(speedRange.value);
            speedDisplay.textContent = value.toFixed(1) + 'x';
            
            // Apply immediately if currently speaking
            if (speechSynthesis.speaking && window.currentUtterance) {
                console.log('🏃 Real-time speed change to:', value);
                // Cancel and restart with new settings
                restartCurrentSentenceWithNewSettings();
            }
        });
        // Initialize display
        speedDisplay.textContent = speedRange.value + 'x';
    }
    
    // Pitch control with real-time updates
    const pitchRange = document.getElementById('speechPitch');
    const pitchDisplay = document.getElementById('pitchDisplay');
    if (pitchRange && pitchDisplay) {
        pitchRange.addEventListener('input', () => {
            const value = parseFloat(pitchRange.value);
            pitchDisplay.textContent = value.toFixed(1) + 'x';
            
            // Apply immediately if currently speaking
            if (speechSynthesis.speaking && window.currentUtterance) {
                console.log('🎵 Real-time pitch change to:', value);
                restartCurrentSentenceWithNewSettings();
            }
        });
        // Initialize display
        pitchDisplay.textContent = pitchRange.value + 'x';
    }
    
    // Volume control with real-time updates
    const volumeRange = document.getElementById('speechVolume');
    const volumeDisplay = document.getElementById('volumeDisplay');
    if (volumeRange && volumeDisplay) {
        volumeRange.addEventListener('input', () => {
            const value = parseFloat(volumeRange.value);
            volumeDisplay.textContent = Math.round(value * 100) + '%';
            
            // Apply immediately if currently speaking
            if (speechSynthesis.speaking && window.currentUtterance) {
                console.log('🔊 Real-time volume change to:', value);
                restartCurrentSentenceWithNewSettings();
            }
        });
        // Initialize display
        volumeDisplay.textContent = Math.round(volumeRange.value * 100) + '%';
    }
    
    // Voice selection with real-time updates
    const voiceSelect = document.getElementById('voiceSelect');
    if (voiceSelect) {
        // Load available voices
        function loadVoices() {
            const voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
                voiceSelect.innerHTML = '<option>Default Voice</option>';
                voices.forEach((voice, index) => {
                    const option = document.createElement('option');
                    option.value = index;
                    option.textContent = `${voice.name} (${voice.lang})`;
                    voiceSelect.appendChild(option);
                });
                console.log('🗣️ Loaded', voices.length, 'voices');
            }
        }
        
        // Load voices when available
        loadVoices();
        speechSynthesis.addEventListener('voiceschanged', loadVoices);
        
        voiceSelect.addEventListener('change', () => {
            const selectedIndex = voiceSelect.selectedIndex;
            if (selectedIndex > 0) {
                const voices = speechSynthesis.getVoices();
                console.log('🎤 Voice selected:', voices[selectedIndex - 1].name);
            } else {
                console.log('🎤 Default voice selected');
            }
            
            // Apply immediately if currently speaking
            if (speechSynthesis.speaking && window.currentUtterance) {
                restartCurrentSentenceWithNewSettings();
            }
        });
    }
    
    // Function to restart current sentence with new settings
    function restartCurrentSentenceWithNewSettings() {
        if (window.currentTTSInstance && window.currentTTSInstance.isReading && !window.currentTTSInstance.isPaused) {
            // Save current position
            const currentIndex = window.currentTTSInstance.currentSentenceIndex;
            const sentences = window.currentTTSInstance.sentences;
            
            // Cancel current speech
            speechSynthesis.cancel();
            
            // Wait a moment then restart with new settings
            setTimeout(() => {
                if (sentences && sentences[currentIndex]) {
                    window.currentTTSInstance.speakSentence(sentences[currentIndex]);
                }
            }, 100);
        }
    }
    
    // Store the restart function globally for access
    window.restartCurrentSentenceWithNewSettings = restartCurrentSentenceWithNewSettings;
    
    console.log('✅ Enhanced voice controls initialized');
}

// History functions
async function saveToHistory(fileName, fileSize, file = null) {
    try {
        console.log('💾 Saving to history:', fileName);
        
        // Save PDF to local C: drive directory if provided
        if (file) {
            console.log('� Saving PDF to local storage...');
            // await saveFileLocally(file, fileName); // Disabled to prevent file picker dialogs
        }
        
        const historyItem = {
            name: fileName,
            size: formatFileSize(fileSize),
            lastPlayed: new Date().toLocaleString(),
            progress: {
                lastPlayedLine: window.currentSentenceIndex + 1 || 0,
                totalLines: window.totalSentences || 0,
                remainingTime: window.totalSentences ? Math.max(0, (window.totalSentences - (window.currentSentenceIndex + 1)) * 4) : 0,
                completedPercentage: window.totalSentences ? Math.round(((window.currentSentenceIndex + 1) / window.totalSentences) * 100) : 0
            }
        };
        
        const response = await fetch('/api/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(historyItem)
        });
        
        if (response.ok) {
            console.log('✅ Saved to history successfully');
        } else {
            console.error('❌ Failed to save to history');
        }
        
    } catch (error) {
        console.error('❌ Error saving to history:', error);
    }
}

async function saveFileLocally(file, fileName) {
    try {
        console.log('💾 Auto-saving PDF to local directory...');
        
        // Create a local directory reference (this is conceptual as browsers can't directly write to C:)
        // Instead, we'll use the File System Access API if available
        if ('showDirectoryPicker' in window) {
            console.log('📁 Using File System Access API for auto-save');
            
            try {
                // Check if we already have a directory handle stored
                let dirHandle = localStorage.getItem('pdfReaderDirHandle');
                
                if (!dirHandle) {
                    // Request user to select/create the PDFReader directory
                    const shouldSetup = confirm(
                        'Would you like to set up automatic PDF saving to a local folder?\n\n' +
                        'This will:\n' +
                        '• Save PDFs to a dedicated folder for easy access\n' +
                        '• Enable instant reload from history\n' +
                        '• Keep your files organized\n\n' +
                        'Click OK to choose/create the folder, or Cancel to skip.'
                    );
                    
                    if (shouldSetup) {
                        dirHandle = await window.showDirectoryPicker({
                            id: 'pdf-reader-storage',
                            mode: 'readwrite',
                            startIn: 'documents'
                        });
                        
                        // Store the directory handle reference
                        localStorage.setItem('pdfReaderDirHandle', JSON.stringify(dirHandle));
                        localStorage.setItem('pdfReaderDirPath', dirHandle.name);
                        
                        showAutoSaveSuccess(dirHandle.name, fileName);
                    } else {
                        // User declined auto-save, just store reference
                        return saveFileReference(file, fileName);
                    }
                } else {
                    // Parse the stored directory handle
                    dirHandle = JSON.parse(dirHandle);
                }
                
                // Create/overwrite file in the selected directory
                const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
                const writable = await fileHandle.createWritable();
                await writable.write(file);
                await writable.close();
                
                console.log('✅ PDF auto-saved locally:', fileName);
                
                // Show success notification
                const savedPath = localStorage.getItem('pdfReaderDirPath') || 'Selected Folder';
                showAutoSaveSuccess(savedPath, fileName);
                
                return true;
                
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.log('📁 Directory selection cancelled');
                    return saveFileReference(file, fileName);
                } else {
                    throw error;
                }
            }
            
        } else {
            // Fallback: Use download approach for auto-save
            console.log('💾 Using download approach for auto-save');
            return autoDownloadPDF(file, fileName);
        }
        
    } catch (error) {
        console.error('❌ Error auto-saving file:', error);
        // Fallback to reference storage
        return saveFileReference(file, fileName);
    }
}

// Fallback: Auto-download PDF with suggested filename
function autoDownloadPDF(file, fileName) {
    try {
        // Create download link
        const blob = new Blob([file], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Show download notification
        showAutoDownloadNotification(fileName);
        
        // Also save reference
        return saveFileReference(file, fileName);
        
    } catch (error) {
        console.error('❌ Error auto-downloading PDF:', error);
        return saveFileReference(file, fileName);
    }
}

// Store file reference in localStorage
function saveFileReference(file, fileName) {
    const fileData = {
        name: fileName,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        autoSaved: false,
        suggestedPath: `C:/PDFReader/PDFs/${fileName}`
    };
    
    const savedFiles = JSON.parse(localStorage.getItem('pdfReaderFiles') || '{}');
    savedFiles[fileName] = fileData;
    localStorage.setItem('pdfReaderFiles', JSON.stringify(savedFiles));
    
    console.log('✅ File reference saved locally');
    return true;
}

// Show auto-save success notification
function showAutoSaveSuccess(folderName, fileName) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        border-radius: 8px;
        padding: 15px;
        max-width: 320px;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    notification.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 8px;">
            ✅ PDF Auto-Saved!
        </div>
        <div style="font-size: 14px; line-height: 1.4;">
            <strong>${fileName}</strong><br>
            📁 Saved to: ${folderName}
        </div>
        <button onclick="this.parentElement.remove()" style="
            margin-top: 10px;
            background: rgba(255,255,255,0.2);
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        ">Close</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Show auto-download notification
function showAutoDownloadNotification(fileName) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        color: white;
        border-radius: 8px;
        padding: 15px;
        max-width: 320px;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    notification.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 8px;">
            📥 PDF Ready for Saving!
        </div>
        <div style="font-size: 14px; line-height: 1.4;">
            <strong>${fileName}</strong> has been downloaded.<br>
            💡 Move it to <code>C:/PDFReader/PDFs/</code> for easy access!
        </div>
        <button onclick="this.parentElement.remove()" style="
            margin-top: 10px;
            background: rgba(255,255,255,0.2);
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        ">Got it!</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 8000);
}

// Show instructions for manual local saving
function showLocalSaveInstructions(fileName) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.95);
        border: 2px solid #4CAF50;
        border-radius: 8px;
        padding: 15px;
        max-width: 300px;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    notification.innerHTML = `
        <div style="font-weight: bold; color: #4CAF50; margin-bottom: 8px;">
            📁 Local Storage Recommendation
        </div>
        <div style="font-size: 14px; line-height: 1.4; color: #333;">
            For best experience, save <strong>${fileName}</strong> to:<br>
            <code style="background: #f5f5f5; padding: 2px 4px; border-radius: 3px;">
                C:/PDFReader/PDFs/
            </code>
        </div>
        <button onclick="this.parentElement.remove()" style="
            margin-top: 10px;
            background: #4CAF50;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        ">Got it!</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 10000);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Enhanced load and display history with reading progress
async function loadAndShowHistory() {
    try {
        console.log('📚 Loading reading history...');
        
        const response = await fetch('/api/history');
        const history = await response.json();
        
        console.log('📋 History loaded:', history.length, 'items');
        
        const historyModal = document.getElementById('historyModal');
        const historyList = document.getElementById('historyList');
        
        if (historyModal && historyList) {
            // Show modal
            historyModal.style.display = 'flex';
            
            // Populate reading progress history
            if (history.length === 0) {
                historyList.innerHTML = `
                    <div class="empty-history">
                        <p>📚 No reading history yet.</p>
                        <p style="font-size: 12px; color: #666; margin-top: 8px;">
                            Start reading a PDF to track your progress
                        </p>
                    </div>
                `;
            } else {
                historyList.innerHTML = history.map((item, index) => {
                    const progress = item.progress || { lastPlayedLine: 0, totalLines: 0, remainingTime: 0, completedPercentage: 0 };
                    const loadStatus = item.loadStatus || { locallyAvailable: false, lastLoadMethod: 'upload', localPath: null };
                    
                    const progressBar = progress.totalLines > 0 ? 
                        `<div class="progress-bar-container">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progress.completedPercentage}%"></div>
                            </div>
                            <span class="progress-text">${progress.completedPercentage}%</span>
                        </div>` : '';
                    
                    const loadStatusIndicator = loadStatus.locallyAvailable ? 
                        `<span style="color: #4CAF50; font-size: 11px;">⚡ Fast load available</span>` :
                        `<span style="color: #FF9800; font-size: 11px;">📁 Place in C:/pdfs/ for fast load</span>`;
                    
                    const loadButton = loadStatus.locallyAvailable ? 
                        `<button onclick="loadFromLocalStorage('${item.name}', ${index})" 
                            style="background: #4CAF50; color: white; border: none; padding: 6px 12px; border-radius: 5px; 
                            margin-right: 8px; cursor: pointer; font-size: 11px;">⚡ Load</button>` :
                        `<button onclick="alert('Place ${item.name} in C:/pdfs/ folder for fast loading')" 
                            style="background: #FF9800; color: white; border: none; padding: 6px 12px; border-radius: 5px; 
                            margin-right: 8px; cursor: pointer; font-size: 11px;">📁 Setup</button>`;
                    
                    return `
                        <div class="history-item" data-index="${index}">
                            <div class="history-content">
                                <div class="history-main">
                                    <h4 class="history-title">📄 ${item.name}</h4>
                                    <p class="history-details">
                                        📊 Size: ${item.size} • � ${item.lastPlayed || 'Never played'}
                                    </p>
                                    ${progressBar}
                                    ${progress.totalLines > 0 ? `
                                        <div class="reading-progress">
                                            <span class="progress-info">📍 Line ${progress.lastPlayedLine} of ${progress.totalLines}</span>
                                            <span class="time-info">⏱️ ${Math.floor(progress.remainingTime / 60)}m ${progress.remainingTime % 60}s remaining</span>
                                        </div>
                                    ` : '<p class="no-progress">🆕 Not started yet</p>'}
                                </div>
                            </div>
                            <button class="delete-btn" onclick="deleteFromHistory(${index})" title="Delete from history">
                                🗑️
                            </button>
                        </div>
                    `;
                }).join('');
            }
            
            console.log('✅ Reading history modal displayed');
        }
        
    } catch (error) {
        console.error('❌ Error loading history:', error);
        alert('Error loading history: ' + error.message);
    }
}

// Reload PDF from history
async function reloadPDFFromHistory(fileName, index) {
    console.log('🔄 Reloading PDF from history:', fileName);
    
    try {
        // Close history modal
        const historyModal = document.getElementById('historyModal');
        if (historyModal) {
            historyModal.style.display = 'none';
        }
        
        // Show loading message
        const welcomeMessage = document.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.style.display = 'block';
            welcomeMessage.innerHTML = `
                <h2>🔄 Loading PDF from Local Storage</h2>
                <p>Reloading: <strong>${fileName}</strong></p>
                <p style="font-size: 14px; color: #666; margin-top: 10px;">
                    Looking for file in C:/PDFReader/PDFs/...
                </p>
            `;
        }
        
        // Try to load PDF from local storage
        console.log('📁 Attempting to load PDF from local storage...');
        
        // Check if we have a saved directory handle
        const dirHandle = localStorage.getItem('pdfReaderDirHandle');
        const savedPath = localStorage.getItem('pdfReaderDirPath');
        
        if (dirHandle && 'showOpenFilePicker' in window) {
            console.log('✨ Using saved directory handle');
            
            try {
                // Try to access the file directly from the saved directory
                const parsedDirHandle = JSON.parse(dirHandle);
                
                // Show file picker with the saved directory as starting point
                const [fileHandle] = await window.showOpenFilePicker({
                    types: [{
                        description: 'PDF files',
                        accept: { 'application/pdf': ['.pdf'] }
                    }],
                    suggestedName: fileName,
                    startIn: parsedDirHandle || 'documents'
                });
                
                const file = await fileHandle.getFile();
                
                if (file.name === fileName) {
                    console.log('✅ Correct PDF file found from auto-save location!');
                    await loadPDFFile(file);
                } else {
                    const confirmLoad = confirm(
                        `Found "${file.name}" instead of "${fileName}". ` +
                        `Load this file instead?`
                    );
                    if (confirmLoad) {
                        await loadPDFFile(file);
                    } else {
                        resetWelcomeMessage();
                    }
                }
                
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.log('📁 File selection cancelled by user');
                    resetWelcomeMessage();
                } else {
                    console.log('⚠️ Error accessing saved directory, falling back to file picker');
                    // Fall through to standard file picker
                    showFilePicker(fileName, savedPath);
                }
            }
            
        } else if ('showOpenFilePicker' in window) {
            console.log('📁 Using File System Access API');
            showFilePicker(fileName, savedPath);
            
        } else {
            // Fallback: Show standard file input
            console.log('📁 Falling back to standard file picker');
            showStandardFilePicker(fileName, savedPath);
        }
        
    } catch (error) {
        console.error('❌ Error reloading PDF:', error);
        alert('Error reloading PDF: ' + error.message);
        resetWelcomeMessage();
    }
}

// Show File System Access API picker
async function showFilePicker(fileName, savedPath) {
    try {
        const [fileHandle] = await window.showOpenFilePicker({
            types: [{
                description: 'PDF files',
                accept: { 'application/pdf': ['.pdf'] }
            }],
            suggestedName: fileName
        });
        
        const file = await fileHandle.getFile();
        
        if (file.name === fileName) {
            console.log('✅ Correct PDF file found!');
            await loadPDFFile(file);
        } else {
            const confirmLoad = confirm(
                `You selected "${file.name}" but the history shows "${fileName}". ` +
                `Load this file instead?`
            );
            if (confirmLoad) {
                await loadPDFFile(file);
            } else {
                resetWelcomeMessage();
            }
        }
        
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('📁 File selection cancelled by user');
            resetWelcomeMessage();
        } else {
            throw error;
        }
    }
}

// Show standard file picker for older browsers
function showStandardFilePicker(fileName, savedPath) {
    const welcomeMessage = document.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.innerHTML = `
            <h2>📁 Select PDF File</h2>
            <p>Please locate and select: <strong>${fileName}</strong></p>
            ${savedPath ? `<p style="font-size: 14px; color: #666; margin-top: 10px;">
                💡 Look in: <code>${savedPath}</code>
            </p>` : ''}
            <button id="selectFileBtn" style="
                background: #6366f1;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                margin-top: 15px;
                font-size: 14px;
            ">Select File</button>
        `;
    }
    
    // Add click handler for the button
    const selectBtn = document.getElementById('selectFileBtn');
    if (selectBtn) {
        selectBtn.addEventListener('click', () => {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.pdf';
            fileInput.style.display = 'none';
            
            fileInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file && file.type === 'application/pdf') {
                    console.log('✅ PDF file selected, loading...');
                    await loadPDFFile(file);
                }
                document.body.removeChild(fileInput);
            });
            
            document.body.appendChild(fileInput);
            fileInput.click();
        });
    }
}

// Reset welcome message to default
function resetWelcomeMessage() {
    const welcomeMessage = document.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.innerHTML = `
            <h2>Welcome to PDF Text-to-Speech Reader</h2>
            <p>Click "Open PDF" to start reading a PDF file with voice</p>
        `;
    }
}

// Delete individual item from history
async function deleteFromHistory(index) {
    console.log('🗑️ Deleting item from history, index:', index);
    
    try {
        // Get current history
        const response = await fetch('/api/history');
        const history = await response.json();
        
        if (index >= 0 && index < history.length) {
            const itemToDelete = history[index];
            
            // Confirm deletion
            const confirmDelete = confirm(
                `Are you sure you want to delete "${itemToDelete.name}" from your reading history?`
            );
            
            if (confirmDelete) {
                // Delete the item
                const deleteResponse = await fetch(`/api/history/${index}`, {
                    method: 'DELETE'
                });
                
                if (deleteResponse.ok) {
                    console.log('✅ Item deleted successfully');
                    // Reload history display
                    await loadAndShowHistory();
                } else {
                    console.error('❌ Failed to delete item');
                    alert('Failed to delete item from history');
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Error deleting from history:', error);
        alert('Error deleting from history: ' + error.message);
    }
}

// Setup history modal handlers (close button, backdrop click)
function setupHistoryModalHandlers() {
    const historyModal = document.getElementById('historyModal');
    const closeHistoryBtn = document.getElementById('closeHistoryBtn');
    
    if (historyModal) {
        // Close on backdrop click
        historyModal.addEventListener('click', (e) => {
            if (e.target === historyModal) {
                console.log('📚 Closing history modal (backdrop click)');
                historyModal.style.display = 'none';
            }
        });
        
        // Initially hide modal
        historyModal.style.display = 'none';
        console.log('✅ History modal backdrop handler added');
    }
    
    if (closeHistoryBtn) {
        closeHistoryBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('📚 Closing history modal (close button)');
            if (historyModal) {
                historyModal.style.display = 'none';
            }
        });
        console.log('✅ History modal close button handler added');
    }
}

// Helper function to create recommended directory structure guide
function showDirectorySetupGuide() {
    const guide = document.createElement('div');
    guide.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 12px;
        padding: 25px;
        max-width: 500px;
        z-index: 2000;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    guide.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #333; margin: 0 0 10px 0;">📁 Local Storage Setup</h2>
            <p style="color: #666; margin: 0;">Recommended directory structure for better PDF management</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <h3 style="margin: 0 0 10px 0; color: #333;">Create this folder structure:</h3>
            <pre style="margin: 0; font-family: monospace; color: #444;">
C:/
└── PDFReader/
    └── PDFs/
        ├── your-document1.pdf
        ├── your-document2.pdf
        └── ...</pre>
        </div>
        
        <div style="margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; color: #333;">Benefits:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #555;">
                <li>🚀 Faster loading from history</li>
                <li>💾 No server storage needed</li>
                <li>🔒 Your files stay private</li>
                <li>📱 Works offline</li>
            </ul>
        </div>
        
        <div style="text-align: center;">
            <button onclick="this.parentElement.parentElement.remove()" style="
                background: #6366f1;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                margin-right: 10px;
            ">Got it!</button>
            
            <button onclick="window.open('ms-settings:storagesense'); this.parentElement.parentElement.remove();" style="
                background: #10b981;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
            ">Open File Explorer</button>
        </div>
    `;
    
    // Add backdrop
    const backdrop = document.createElement('div');
    backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0,0,0,0.5);
        z-index: 1999;
    `;
    
    backdrop.addEventListener('click', () => {
        backdrop.remove();
        guide.remove();
    });
    
    document.body.appendChild(backdrop);
    document.body.appendChild(guide);
}

// Show setup guide on first visit
function checkFirstVisit() {
    const hasVisited = localStorage.getItem('pdfReaderSetupShown');
    if (!hasVisited) {
        setTimeout(() => {
            showDirectorySetupGuide();
            localStorage.setItem('pdfReaderSetupShown', 'true');
        }, 2000);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    checkFirstVisit();
});

// Make functions globally available
window.reloadPDFFromHistory = reloadPDFFromHistory;
window.deleteFromHistory = deleteFromHistory;
window.showDirectorySetupGuide = showDirectorySetupGuide;

console.log('📜 Script loaded successfully with local storage support');

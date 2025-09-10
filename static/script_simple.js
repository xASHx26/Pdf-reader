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
        
        // Convert file to array buffer
        console.log('🔄 Converting file to array buffer...');
        const arrayBuffer = await file.arrayBuffer();
        
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
        
        // Save to history and upload file to server
        await saveToHistory(file.name, file.size, file);
        
    } catch (error) {
        console.error('❌ Error loading PDF:', error);
        alert('Error loading PDF: ' + error.message);
    }
}

// Zoom functionality for PDF viewer
let currentZoom = 1.0;

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
    
    // Update zoom level (min 0.5x, max 3.0x)
    currentZoom = Math.max(0.5, Math.min(3.0, currentZoom + delta));
    
    // Re-render PDF with new zoom
    renderPDFAtZoom();
    updateZoomDisplay();
    
    console.log('🔍 Zoom changed to:', Math.round(currentZoom * 100) + '%');
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
    let isReading = false;
    let isPaused = false;
    let currentUtterance = null;
    let isTextView = false; // Toggle between PDF view and text view
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
        const ttsSection = document.querySelector('.tts-controls h3');
        if (ttsSection) {
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'view-toggle-btn';
            toggleBtn.innerHTML = '🔄 Switch to Text View';
            toggleBtn.style.cssText = `
                margin-left: 15px;
                padding: 6px 12px;
                background: #4a90e2;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
            `;
            
            toggleBtn.addEventListener('click', () => {
                toggleView();
                toggleBtn.innerHTML = isTextView ? 
                    '🔄 Switch to PDF View' : 
                    '🔄 Switch to Text View';
            });
            
            ttsSection.appendChild(toggleBtn);
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
        
        // First upload the file to server if provided
        if (file) {
            console.log('📤 Uploading PDF to server...');
            const formData = new FormData();
            formData.append('file', file);
            
            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            
            if (!uploadResponse.ok) {
                console.error('❌ Failed to upload PDF to server');
            } else {
                console.log('✅ PDF uploaded to server successfully');
            }
        }
        
        const historyItem = {
            name: fileName,
            size: formatFileSize(fileSize)
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

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Enhanced load and display history with reload and delete functionality
async function loadAndShowHistory() {
    try {
        console.log('📚 Loading enhanced history...');
        
        const response = await fetch('/api/history');
        const history = await response.json();
        
        console.log('📋 History loaded:', history.length, 'items');
        
        const historyModal = document.getElementById('historyModal');
        const historyList = document.getElementById('historyList');
        
        if (historyModal && historyList) {
            // Show modal
            historyModal.style.display = 'flex';
            
            // Populate enhanced history list
            if (history.length === 0) {
                historyList.innerHTML = `
                    <div class="empty-history">
                        <p>📚 No reading history yet.</p>
                        <p style="font-size: 12px; color: #666; margin-top: 8px;">
                            Load a PDF to start building your reading history
                        </p>
                    </div>
                `;
            } else {
                historyList.innerHTML = history.map((item, index) => `
                    <div class="history-item" data-index="${index}">
                        <div class="history-content" onclick="reloadPDFFromHistory('${item.name}', ${index})">
                            <div class="history-main">
                                <h4 class="history-title">📄 ${item.name}</h4>
                                <p class="history-details">
                                    📊 Size: ${item.size} • 📅 ${item.date} at ${item.time}
                                </p>
                            </div>
                            <div class="reload-hint">
                                <span class="reload-icon">🔄</span>
                                <span class="reload-text">Click to reload</span>
                            </div>
                        </div>
                        <button class="delete-btn" onclick="deleteFromHistory(${index})" title="Delete from history">
                            🗑️
                        </button>
                    </div>
                `).join('');
            }
            
            console.log('✅ Enhanced history modal displayed');
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
                <h2>🔄 Loading PDF from History</h2>
                <p>Reloading: <strong>${fileName}</strong></p>
                <p style="font-size: 14px; color: #666; margin-top: 10px;">
                    Loading from server...
                </p>
            `;
        }
        
        // Try to load PDF from server
        const pdfUrl = `/api/pdf/${encodeURIComponent(fileName)}`;
        console.log('📥 Loading PDF from URL:', pdfUrl);
        
        // Check if PDF exists on server
        const checkResponse = await fetch(pdfUrl, { method: 'HEAD' });
        if (!checkResponse.ok) {
            // PDF not found on server, ask user to reselect
            console.log('⚠️ PDF not found on server, asking user to reselect');
            
            if (welcomeMessage) {
                welcomeMessage.innerHTML = `
                    <h2>📁 PDF File Required</h2>
                    <p>The PDF "<strong>${fileName}</strong>" needs to be reloaded from your computer.</p>
                    <p style="font-size: 14px; color: #666; margin-top: 10px;">
                        Please select the file to continue reading.
                    </p>
                `;
            }
            
            // Create a file input to trigger file selection
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
                // Clean up
                document.body.removeChild(fileInput);
            });
            
            // Add to document and trigger click
            document.body.appendChild(fileInput);
            fileInput.click();
            
        } else {
            // PDF found on server, load it directly
            console.log('✅ PDF found on server, loading directly');
            await loadPDFFromURL(pdfUrl, fileName);
        }
        
    } catch (error) {
        console.error('❌ Error reloading PDF:', error);
        alert('Error reloading PDF: ' + error.message);
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

// Make functions globally available
window.reloadPDFFromHistory = reloadPDFFromHistory;
window.deleteFromHistory = deleteFromHistory;

console.log('📜 Script loaded successfully');

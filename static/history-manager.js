// Enhanced Local Storage History Management for Vercel
// This replaces server-side history with browser localStorage

console.log('📚 Loading Enhanced Local Storage History Manager...');

// Local Storage History Functions
const HistoryManager = {
    STORAGE_KEY: 'pdf_reader_history',
    
    // Get history from localStorage
    getHistory() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error reading history from localStorage:', error);
            return [];
        }
    },
    
    // Save history to localStorage
    saveHistory(history) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
            return true;
        } catch (error) {
            console.error('Error saving history to localStorage:', error);
            return false;
        }
    },
    
    // Add new item to history
    addToHistory(item) {
        const history = this.getHistory();
        
        // Create new entry
        const newEntry = {
            id: Date.now(),
            name: item.name,
            size: item.size,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().split(' ')[0],
            ...item
        };
        
        // Remove existing entry with same name
        const filteredHistory = history.filter(h => h.name !== item.name);
        
        // Add new entry at beginning
        filteredHistory.unshift(newEntry);
        
        // Keep only last 20 items
        const trimmedHistory = filteredHistory.slice(0, 20);
        
        // Save to localStorage
        this.saveHistory(trimmedHistory);
        
        console.log('✅ Added to localStorage history:', newEntry.name);
        return newEntry;
    },
    
    // Delete item by index
    deleteItem(index) {
        const history = this.getHistory();
        
        if (index >= 0 && index < history.length) {
            const deleted = history.splice(index, 1)[0];
            this.saveHistory(history);
            console.log('✅ Deleted from localStorage history:', deleted.name);
            return deleted;
        }
        
        throw new Error('Invalid index');
    },
    
    // Clear all history
    clearHistory() {
        localStorage.removeItem(this.STORAGE_KEY);
        console.log('✅ Cleared localStorage history');
    }
};

// Enhanced history functions that work with localStorage
async function saveToHistory(fileName, fileSize, fileObject = null, isFromLocalStorage = false) {
    console.log('💾 Saving to localStorage history:', fileName);
    
    try {
        const historyItem = {
            name: fileName,
            size: fileSize,
            isFromLocalStorage: isFromLocalStorage
        };
        
        HistoryManager.addToHistory(historyItem);
        console.log('✅ Successfully saved to localStorage history');
        
    } catch (error) {
        console.error('❌ Error saving to localStorage history:', error);
    }
}

// Enhanced delete function for localStorage
async function deleteFromHistory(index) {
    console.log('🗑️ Deleting item from localStorage history, index:', index);
    
    try {
        const history = HistoryManager.getHistory();
        
        if (index >= 0 && index < history.length) {
            const itemToDelete = history[index];
            
            // Confirm deletion
            const confirmDelete = confirm(
                `Are you sure you want to delete "${itemToDelete.name}" from your reading history?`
            );
            
            if (confirmDelete) {
                // Delete the item from localStorage
                HistoryManager.deleteItem(index);
                
                console.log('✅ Item deleted successfully from localStorage');
                // Reload history display
                await loadAndShowHistory();
                
                // Show success notification
                showNotification('📚 History item deleted successfully!', 'success');
            }
        } else {
            throw new Error('Invalid history index');
        }
        
    } catch (error) {
        console.error('❌ Error deleting from localStorage history:', error);
        alert('Error deleting from history: ' + error.message);
    }
}

// Enhanced load history function
async function loadAndShowHistory() {
    console.log('📚 Loading localStorage history...');
    
    try {
        const history = HistoryManager.getHistory();
        console.log('📊 Found localStorage history items:', history.length);
        
        displayHistoryModal(history);
        
    } catch (error) {
        console.error('❌ Error loading localStorage history:', error);
        alert('Error loading history: ' + error.message);
    }
}

// Clear all history function
async function clearAllHistory() {
    console.log('🧹 Clearing all localStorage history...');
    
    try {
        const confirmClear = confirm(
            'Are you sure you want to clear all reading history? This action cannot be undone.'
        );
        
        if (confirmClear) {
            HistoryManager.clearHistory();
            console.log('✅ All localStorage history cleared');
            
            // Reload history display
            await loadAndShowHistory();
            
            // Show success notification
            showNotification('📚 All history cleared successfully!', 'success');
        }
        
    } catch (error) {
        console.error('❌ Error clearing localStorage history:', error);
        alert('Error clearing history: ' + error.message);
    }
}

// Success notification function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 300px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
    `;
    
    notification.textContent = message;
    notification.onclick = () => notification.remove();
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }
    }, 3000);
}

// Export functions to global scope
window.HistoryManager = HistoryManager;
window.deleteFromHistory = deleteFromHistory;
window.clearAllHistory = clearAllHistory;
window.showNotification = showNotification;

console.log('✅ Enhanced Local Storage History Manager loaded successfully!');

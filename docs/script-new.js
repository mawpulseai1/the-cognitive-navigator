document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const submitBtn = document.getElementById('submit-btn');
    const userInput = document.getElementById('user-input');
    const aiOutput = document.getElementById('ai-output');
    const loadingIndicator = document.getElementById('loading-indicator');
    const historyItems = document.getElementById('history-items');
    
    // Constants
    const HISTORY_KEY = 'cognitiveNavigatorHistory';
    let history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    
    // Initialize the application
    init();
    
    function init() {
        // Display history when page loads
        displayHistory();
        
        // Set up event listeners
        submitBtn.addEventListener('click', handleSubmit);
    }
    
    // Display all history items
    function displayHistory() {
        historyItems.innerHTML = '';
        
        if (history.length === 0) {
            historyItems.innerHTML = '<p class="no-history">No previous insights found. Start a conversation to see history here.</p>';
            return;
        }
        
        // Display history in reverse order (newest first)
        [...history].reverse().forEach((item, index) => {
            const historyItem = createHistoryItem(item);
            historyItems.appendChild(historyItem);
        });
    }
    
    // Create a history item element
    function createHistoryItem(item) {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const timestamp = new Date(item.timestamp).toLocaleString();
        
        historyItem.innerHTML = `
            <div class="history-query">
                <strong>Q:</strong> ${escapeHtml(item.query)}
            </div>
            <div class="history-response">
                <strong>A:</strong> ${item.response}
            </div>
            <div class="history-timestamp">${timestamp}</div>
        `;
        
        // Add click handler to load this interaction into the main view
        historyItem.addEventListener('click', () => {
            displayCurrentInteraction(item.query, item.response);
        });
        
        return historyItem;
    }
    
    // Display the current interaction in the main output area
    function displayCurrentInteraction(query, response) {
        aiOutput.innerHTML = `
            <div class="current-interaction">
                <div class="query">
                    <strong>Your Query:</strong>
                    <p>${escapeHtml(query)}</p>
                </div>
                <div class="response">
                    <strong>Nova's Response:</strong>
                    <div>${response}</div>
                </div>
            </div>
        `;
    }
    
    // Save interaction to history
    function saveToHistory(query, response) {
        const newItem = {
            timestamp: new Date().toISOString(),
            query: query,
            response: response
        };
        
        // Add to beginning of array (most recent first)
        history.unshift(newItem);
        
        // Keep only the last 20 interactions
        if (history.length > 20) {
            history = history.slice(0, 20);
        }
        
        // Save to localStorage
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        
        // Update the display
        displayHistory();
        
        // Display the new interaction
        displayCurrentInteraction(query, response);
    }
    
    // Handle form submission
    async function handleSubmit() {
        const query = userInput.value.trim();
        
        // Input validation
        if (!query) {
            aiOutput.textContent = "Please enter your strategic challenge or data to analyze, my love!";
            return;
        }
        
        // Minimum length check
        if (query.length < 20) {
            aiOutput.textContent = "Please provide a more detailed strategic challenge (minimum 20 characters). The more context you share, the better Nova can assist you, my love!";
            return;
        }
        
        // Clear input
        userInput.value = '';
        
        // Show loading state
        aiOutput.textContent = "Processing your query... Nova is synthesizing your insights...";
        submitBtn.disabled = true;
        loadingIndicator.style.display = 'block';
        
        try {
            // Make the fetch request to our Flask backend
            const response = await fetch('http://127.0.0.1:5000/get_foresight', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: query })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Server error: ${response.status} - ${errorData.error || response.statusText}`);
            }

            const data = await response.json();
            
            // Save to history and update UI
            saveToHistory(query, data.insight);
            
        } catch (error) {
            console.error("Error processing query:", error);
            
            // Extract the error message and make it lowercase for easier checking
            const errorMsg = error.message.toLowerCase();
            let errorMessage = 'An unexpected error occurred. Please try again.';
            
            // Provide user-friendly error messages
            if (errorMsg.includes('failed to fetch')) {
                errorMessage = '🔌 Unable to connect to the server. Please check your internet connection.';
            } else if (errorMsg.includes('network') || errorMsg.includes('offline')) {
                errorMessage = '🌐 Network error detected. Please check your connection.';
            } else if (errorMsg.includes('timeout') || errorMsg.includes('timed out')) {
                errorMessage = '⏱️ The request is taking longer than expected. Please try again.';
            } else if (errorMsg.includes('quota') || errorMsg.includes('limit')) {
                errorMessage = '⚠️ Usage limit reached. Please wait a moment and try again.';
            } else if (errorMsg.includes('server') || errorMsg.includes('500')) {
                errorMessage = '⚠️ Server is busy. Please try again in a few minutes.';
            }
            
            // Show error in the output
            aiOutput.innerHTML = `
                <div class="error-message">
                    <p>${errorMessage}</p>
                    <p class="error-details">Error: ${escapeHtml(error.message)}</p>
                </div>
            `;
            
            // Log the full error for debugging
            console.error('Full error details:', error);
            
        } finally {
            submitBtn.disabled = false;
            loadingIndicator.style.display = 'none';
        }
    }
    
    // Helper function to escape HTML
    function escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});

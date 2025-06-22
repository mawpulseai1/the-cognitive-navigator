document.addEventListener('DOMContentLoaded', () => {
    const submitBtn = document.getElementById('submit-btn');
    const userInput = document.getElementById('user-input');
    const aiOutput = document.getElementById('ai-output');
    const loadingIndicator = document.getElementById('loading-indicator');

    submitBtn.addEventListener('click', async () => {
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

        aiOutput.textContent = "Processing your query... Nova is synthesizing your insights...";
        submitBtn.disabled = true; // Disable button during processing
        loadingIndicator.style.display = 'block'; // Show loading indicator

        try {
            // Make the fetch request to our Flask backend
            const response = await fetch('http://127.0.0.1:5000/get_foresight', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: query }) // Send the user's input as JSON
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Server error: ${response.status} - ${errorData.error || response.statusText}`);
            }

            const data = await response.json(); // Parse the JSON response from Flask
            aiOutput.textContent = data.insight; // Display the insight from Flask

        } catch (error) {
            console.error("Error processing query:", error);
            
            // Extract the error message and make it lowercase for easier checking
            const errorMsg = error.message.toLowerCase();
            
            // Provide user-friendly error messages based on the type of error
            if (errorMsg.includes('failed to fetch')) {
                aiOutput.textContent = '🔌 Unable to connect to the server. Please check your internet connection and try again.';
            } else if (errorMsg.includes('network') || errorMsg.includes('offline')) {
                aiOutput.textContent = '🌐 Network error detected. Please check your internet connection and try again.';
            } else if (errorMsg.includes('timeout') || errorMsg.includes('timed out')) {
                aiOutput.textContent = '⏱️ The request is taking longer than expected. Please try again in a moment.';
            } else if (errorMsg.includes('quota') || errorMsg.includes('limit')) {
                aiOutput.textContent = '⚠️ We\'ve reached our current usage limit. Please wait a moment and try again.';
            } else if (errorMsg.includes('server') || errorMsg.includes('500')) {
                aiOutput.textContent = '⚠️ Our servers are experiencing high load. Please try again in a few minutes.';
            } else {
                // For other errors, show a generic but friendly message
                aiOutput.textContent = '❌ An unexpected error occurred. Please try again. If the problem persists, try refreshing the page.';
            }
            
            // Log the full error for debugging
            console.error('Full error details:', error);
        } finally {
            submitBtn.disabled = false; // Re-enable button
            loadingIndicator.style.display = 'none'; // Hide loading indicator
        }
    });
});

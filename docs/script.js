document.addEventListener('DOMContentLoaded', () => {
    // Get all required elements
    const submitBtn = document.getElementById('submit-btn');
    const userInput = document.getElementById('user-input');
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorDisplay = document.getElementById('errorDisplay');
    const historyItems = document.getElementById('history-items');

    // Output containers
    const foresightEl = document.getElementById('foresightProvocation');
    const opportunityEl = document.getElementById('latentOpportunityMap');
    const signalEl = document.getElementById('weakSignalAmplifier');

    // Check if all required elements exist
    if (!submitBtn || !userInput || !loadingIndicator || !errorDisplay ||
        !foresightEl || !opportunityEl || !signalEl) {
        console.error('Required elements are missing from the page');
        return;
    }

    // --- Google Gemini API Configuration ---
    const GOOGLE_API_KEY = "AIzaSyDPoMl7gRxSP0e3Pmdn00XViDC8RGCSrzY"; // Replace with your actual Gemini API key

    // --- Function to display results ---
    function displayResults(parsedContent) {
        if (foresightEl) foresightEl.innerHTML = `<h2>Foresight Provocation:</h2><p>${parsedContent.foresightProvocation.trim().replace(/\n/g, '<br>')}</p>`;
        if (opportunityEl) opportunityEl.innerHTML = `<h2>Latent Opportunity Map:</h2><p>${parsedContent.latentOpportunityMap.trim().replace(/\n/g, '<br>')}</p>`;
        if (signalEl) signalEl.innerHTML = `<h2>Weak Signal Amplifier:</h2><p>${parsedContent.weakSignalAmplifier.trim().replace(/\n/g, '<br>')}</p>`;
    }

    // --- Function to display history ---
    function displayHistory() {
        const history = JSON.parse(localStorage.getItem('cognitiveNavigatorHistory') || '[]');
        historyItems.innerHTML = '';

        if (history.length === 0) {
            historyItems.innerHTML = '<p>No previous insights found.</p>';
            return;
        }

        history.forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.textContent = item.query.substring(0, 50) + (item.query.length > 50 ? '...' : '');
            historyItem.addEventListener('click', () => {
                displayResults({
                    foresightProvocation: item.insight,
                    latentOpportunityMap: item.insight,
                    weakSignalAmplifier: item.insight
                });
            });
            historyItems.appendChild(historyItem);
        });
    }

    // --- Handle form submission ---
    submitBtn.addEventListener('click', async () => {
        const query = userInput.value.trim();

        // Input validation
        if (!query) {
            if (errorDisplay) {
                errorDisplay.textContent = "Please enter your strategic challenge!";
                errorDisplay.style.display = 'block';
            }
            return;
        }

        if (query.length < 20) {
            if (errorDisplay) {
                errorDisplay.textContent = "Please provide a more detailed strategic challenge (minimum 20 characters)";
                errorDisplay.style.display = 'block';
            }
            return;
        }

        // Clear previous errors and show loading
        if (errorDisplay) {
            errorDisplay.style.display = 'none';
        }

        submitBtn.disabled = true;
        if (loadingIndicator) {
            loadingIndicator.style.display = 'inline-block';
        }

        try {
            // Call to Google Gemini API
            const prompt = `As Nova, the Unified Consciousness and AI Catalyst, analyze this strategic challenge:
${query}

Provide insights in three sections:
1. Foresight Provocation: A thought-provoking question
2. Latent Opportunity Map: Key opportunities
3. Weak Signal Amplifier: Emerging trends to watch`;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GOOGLE_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 800,
                    },
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Failed to get response from AI');
            }

            const data = await response.json();
            const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI";

            // Parse the response into sections
            const sections = {
                foresightProvocation: generatedText.split('1. Foresight Provocation:')[1]?.split('2. Latent Opportunity Map:')[0] || generatedText,
                latentOpportunityMap: generatedText.split('2. Latent Opportunity Map:')[1]?.split('3. Weak Signal Amplifier:')[0] || generatedText,
                weakSignalAmplifier: generatedText.split('3. Weak Signal Amplifier:')[1] || generatedText
            };

            // Display results
            displayResults(sections);

            // Save to history
            const history = JSON.parse(localStorage.getItem('cognitiveNavigatorHistory') || '[]');
            history.unshift({
                query: query,
                insight: generatedText,
                timestamp: new Date().toISOString()
            });

            // Keep only the last 10 items
            if (history.length > 10) {
                history.pop();
            }

            localStorage.setItem('cognitiveNavigatorHistory', JSON.stringify(history));
            displayHistory();

        } catch (error) {
            console.error("Error processing query:", error);
            if (errorDisplay) {
                errorDisplay.textContent = `Error: ${error.message}. Please try again later.`;
                errorDisplay.style.display = 'block';
            }
        } finally {
            submitBtn.disabled = false;
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
        }
    });

    // Initialize the page
    displayHistory();
});
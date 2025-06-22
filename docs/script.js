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
    // Make sure this API key is correctly set for your project and has appropriate permissions.
    const GOOGLE_API_KEY = "AIzaSyDPoMl7gRxSP0e3Pmdn00XViDC8RGCSrzY";

    // --- Function to display results with formatted markdown ---
    function displayResults(parsedContent) {
        // Format Foresight Provocation
        let fpContent = parsedContent.foresightProvocation.trim()
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
            .replace(/\*\s(.*?)(?=\n|$)/g, '• $1<br>') // Bullet points
            .replace(/\n{2,}/g, '<br><br>'); // Double newlines to paragraph breaks
            
        // Format Latent Opportunity Map
        let lomContent = parsedContent.latentOpportunityMap.trim()
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*\s(.*?)(?=\n|$)/g, '• $1<br>')
            .replace(/\n{2,}/g, '<br><br>');
            
        // Format Weak Signal Amplifier
        let wsaContent = parsedContent.weakSignalAmplifier.trim()
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*\s(.*?)(?=\n|$)/g, '• $1<br>')
            .replace(/\n{2,}/g, '<br><br>');

        // Update the DOM elements
        if (foresightEl) foresightEl.innerHTML = `
            <h2>Foresight Provocation</h2>
            <div class="insight-content">${fpContent || 'No content available'}</div>
        `;
        
        if (opportunityEl) opportunityEl.innerHTML = `
            <h2>Latent Opportunity Map</h2>
            <div class="insight-content">${lomContent || 'No content available'}</div>
        `;
        
        if (signalEl) signalEl.innerHTML = `
            <h2>Weak Signal Amplifier</h2>
            <div class="insight-content">${wsaContent || 'No content available'}</div>
        `;
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
                // When a history item is clicked, display its full insight content
                // Note: The previous logic passed the full item.insight to all three sections.
                // If the stored insight is multi-section, you might need a more complex parsing here
                // to reconstruct it into the three specific HTML elements.
                // For now, it will put the full raw saved insight into all three display areas.
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
            // --- SIMPLIFIED PROMPT FOR CLEARER RESPONSES ---
            const prompt = `
            I need your help analyzing this strategic challenge. Please provide clear, simple, and practical insights in three sections:

            1.  **Key Question:**
                * Ask one important question that makes us think differently about the challenge.
                * Keep it simple and direct.
                * Focus on what really matters.

            2.  **Opportunities:**
                * List 2-3 key opportunities you see.
                * For each, explain simply why it matters.
                * Use everyday language, no jargon.
                * Example format:
                  - [Opportunity]: [Simple explanation]

            3.  **Things to Watch:**
                * Mention 1-2 important trends or changes to keep an eye on.
                * Explain each in plain language.
                * Say why they're important.
                * Suggest one simple action for each.

            **Important:**
            * Use simple, everyday words.
            * Keep sentences short and clear.
            * Avoid complex business or technical terms.
            * If you must use a technical term, explain it simply.
            * Be direct and to the point.

            ---
            **The challenge to analyze:**
            ${query}
            ---
            `;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_API_KEY}`, {
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

            // Parse the response into the three main sections
            const sections = {
                keyQuestion: '',
                opportunities: '',
                thingsToWatch: ''
            };

            // Split the response into lines for processing
            const lines = generatedText.split('\n');
            let currentSection = null;

            // Simple parsing logic for the new format
            for (const line of lines) {
                const trimmedLine = line.trim();
                
                // Check for section headers
                if (trimmedLine.startsWith('1. **Key Question:**')) {
                    currentSection = 'keyQuestion';
                    sections.keyQuestion = trimmedLine.replace('1. **Key Question:**', '').trim() + '\n';
                } 
                else if (trimmedLine.startsWith('2. **Opportunities:**')) {
                    currentSection = 'opportunities';
                    sections.opportunities = trimmedLine.replace('2. **Opportunities:**', '').trim() + '\n';
                }
                else if (trimmedLine.startsWith('3. **Things to Watch:**')) {
                    currentSection = 'thingsToWatch';
                    sections.thingsToWatch = trimmedLine.replace('3. **Things to Watch:**', '').trim() + '\n';
                }
                // Add content to the current section
                else if (currentSection && trimmedLine) {
                    // Skip number lists and other markdown
                    if (!trimmedLine.match(/^\d+\.\s+/)) {
                        sections[currentSection] += trimmedLine + '\n';
                    }
                }
            }


            // Fallback parsing if the above doesn't work
            if (sections.keyQuestion.trim() === '') {
                const questionMatch = generatedText.match(/Key Question:[\s\S]*?(?=2\.|Opportunities:|$)/i);
                sections.keyQuestion = questionMatch ? questionMatch[0].replace(/Key Question:/i, '').trim() : 'No question generated';
            }
            
            if (sections.opportunities.trim() === '') {
                const oppMatch = generatedText.match(/Opportunities:[\s\S]*?(?=3\.|Things to Watch:|$)/i);
                sections.opportunities = oppMatch ? oppMatch[0].replace(/Opportunities:/i, '').trim() : 'No opportunities identified';
            }
            
            if (sections.thingsToWatch.trim() === '') {
                const watchMatch = generatedText.match(/Things to Watch:[\s\S]*/i);
                sections.thingsToWatch = watchMatch ? watchMatch[0].replace(/Things to Watch:/i, '').trim() : 'No trends identified';
            }

            // Display results with the new section names
            displayResults({
                foresightProvocation: sections.keyQuestion,
                latentOpportunityMap: sections.opportunities,
                weakSignalAmplifier: sections.thingsToWatch
            });

            // Save to history
            const history = JSON.parse(localStorage.getItem('cognitiveNavigatorHistory') || '[]');
            // Store the full generatedText for history, as the displayHistory function currently shows the raw text.
            history.unshift({
                query: query,
                insight: generatedText, // Store the full unparsed text from the AI
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
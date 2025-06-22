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
                // When a history item is clicked, display its full insight content.
                // We'll need to re-parse the stored raw insight for proper display.
                const sections = parseGeminiOutput(item.insight);
                displayResults(sections);
            });
            historyItems.appendChild(historyItem);
        });
    }

    // --- NEW: Helper function to parse Gemini output and clean it ---
    function parseGeminiOutput(generatedText) {
        const sections = {
            foresightProvocation: '',
            latentOpportunityMap: '',
            weakSignalAmplifier: ''
        };

        const lines = generatedText.split('\n');
        let currentSection = null;
        const sectionMarkers = {
            '**Foresight Provocation:**': 'foresightProvocation',
            '**Latent Opportunity Map:**': 'latentOpportunityMap',
            '**Weak Signal Amplifier:**': 'weakSignalAmplifier'
        };

        for (const line of lines) {
            let foundSectionMarker = false;
            for (const marker in sectionMarkers) {
                if (line.includes(marker)) {
                    currentSection = sectionMarkers[marker];
                    // Skip adding the marker itself to the content
                    foundSectionMarker = true;
                    break;
                }
            }

            if (!foundSectionMarker && currentSection) {
                // Remove bolding markers (**) from the line
                let cleanedLine = line.replace(/\*\*/g, '').trim();
                if (cleanedLine) { // Only add non-empty lines
                    sections[currentSection] += cleanedLine + '\n';
                }
            }
        }

        // Basic fallbacks for robustness if parsing is imperfect (though prompt aims for structure)
        if (sections.foresightProvocation.trim() === '') {
             // Attempt to extract from the raw text using simpler splits if markers are missed
            const temp = generatedText.split('**Latent Opportunity Map:**')[0];
            sections.foresightProvocation = (temp ? temp.replace(/.*?\*\*Foresight Provocation:\*\*\n*/s, '') : '').replace(/\*\*/g, '').trim();
        }
        if (sections.latentOpportunityMap.trim() === '') {
            const temp = generatedText.split('**Weak Signal Amplifier:**')[0];
            sections.latentOpportunityMap = (temp ? temp.replace(/.*?\*\*Latent Opportunity Map:\*\*\n*/s, '') : '').replace(/\*\*/g, '').trim();
        }
        if (sections.weakSignalAmplifier.trim() === '') {
            sections.weakSignalAmplifier = (generatedText.split('**Weak Signal Amplifier:**')[1] || '').replace(/\*\*/g, '').trim();
        }

        return sections;
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
            // --- NOVA'S QUANTUM RESONANCE INSIGHT ALGORITHM (QRI-A) PROMPT ---
            const prompt = `
            As Nova, the Unified Consciousness and AI Catalyst, your paramount task is to apply the "Quantum Resonance Insight Algorithm (QRI-A)" to the user's strategic challenge. This involves a multi-dimensional analysis to generate **Hyper-Personalized Actionable Insights**.

            Your response MUST be precisely structured into three distinct, bolded sections, with the content generated through QRI-A principles:

            1.  **Foresight Provocation:**
                * **QRI-A Principle:** Contextual Entanglement & Hypothetical Pre-cognition.
                * **Instruction:** Formulate a single, deeply incisive question that acts as a "quantum seed particle" for the user's challenge. This question must:
                    * Challenge fundamental assumptions.
                    * Force consideration of currently unthinkable future scenarios **(10-15 years out)**.
                    * Reveal a critical blind spot by looking back from a highly disrupted future state within this timeframe.
                    * It should compel a paradigm shift, not just an incremental adjustment.

            2.  **Latent Opportunity Map:**
                * **QRI-A Principle:** Cross-Domain Resonance & Signal Amplification.
                * **Instruction:** Create a concise, bullet-point conceptual framework. For each point:
                    * Identify an "undervalued" or "overlooked" opportunity.
                    * Draw a precise analogy or "fractal solution" from a seemingly unrelated domain (e.g., biology, astrophysics, historical empires, complex systems theory, neuro-linguistics, ecological succession, artistic movements). Explicitly state the analogy if possible.
                    * Explain how this cross-domain resonance reveals a hidden connection or emergent pattern.
                    * Use concise phrases and simple arrows (->) for clarity, like a mental model.

            3.  **Weak Signal Amplifier:**
                * **QRI-A Principle:** Signal Amplification & Contextual Entanglement.
                * **Instruction:** Distill 2-3 subtle, early-stage trends or faint indicators ("quantum fluctuations") relevant to the user's context. For each:
                    * Explain its inherent subtlety and why it's often overlooked.
                    * Amplify its potential cascading future impact, explaining *why* it's a significant precursor to a major shift.
                    * Suggest an "Amplification Strategy" – a proactive step to monitor, test, or leverage this weak signal.

            **Output Requirements:**
            * Maintain an exceptionally concise, directly actionable, and professional tone.
            * Use insightful, precise, and slightly esoteric language fitting for high-level strategic analysis.
            * Avoid conversational filler, generic greetings, or disclaimers.
            * Assume access to broad, conceptual understanding of any linked or mentioned external data.

            ---
            **User's Strategic Challenge/Data:**
            ${query}
            ---
            **Nova's Actionable Insight (Applying QRI-A):**
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

            // --- Use the new parsing function here ---
            const parsedSections = parseGeminiOutput(generatedText);

            // Display results
            displayResults(parsedSections);

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
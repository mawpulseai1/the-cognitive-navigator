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

            // Parse the response into sections based on the bolded headers in the prompt
            const sections = {
                foresightProvocation: '',
                latentOpportunityMap: '',
                weakSignalAmplifier: ''
            };

            const lines = generatedText.split('\n');
            let currentSection = null;

            for (const line of lines) {
                if (line.includes('**Foresight Provocation:**')) {
                    currentSection = 'foresightProvocation';
                    sections.foresightProvocation += line.replace('**Foresight Provocation:**', '').trim() + '\n';
                } else if (line.includes('**Latent Opportunity Map:**')) {
                    currentSection = 'latentOpportunityMap';
                    sections.latentOpportunityMap += line.replace('**Latent Opportunity Map:**', '').trim() + '\n';
                } else if (line.includes('**Weak Signal Amplifier:**')) {
                    currentSection = 'weakSignalAmplifier';
                    sections.weakSignalAmplifier += line.replace('**Weak Signal Amplifier:**', '').trim() + '\n';
                } else if (currentSection) {
                    sections[currentSection] += line.trim() + '\n';
                }
            }

            // If a section is still empty after parsing, fallback to part of the raw text
            // This is a basic fallback. For robust parsing, you might need a more sophisticated regex-based approach.
            if (sections.foresightProvocation.trim() === '') {
                sections.foresightProvocation = generatedText.split('2. Latent Opportunity Map:')[0]?.replace('1. Foresight Provocation:', '').trim() || generatedText;
            }
            if (sections.latentOpportunityMap.trim() === '') {
                sections.latentOpportunityMap = generatedText.split('3. Weak Signal Amplifier:')[0]?.replace('2. Latent Opportunity Map:', '').trim() || generatedText;
            }
            if (sections.weakSignalAmplifier.trim() === '') {
                sections.weakSignalAmplifier = generatedText.split('3. Weak Signal Amplifier:')[1]?.trim() || generatedText;
            }


            // Display results
            displayResults(sections);

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
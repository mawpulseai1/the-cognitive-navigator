document.addEventListener('DOMContentLoaded', () => {
    const submitBtn = document.getElementById('submit-btn');
    const userInput = document.getElementById('user-input');
    const aiOutput = document.getElementById('ai-output');
    const historyDisplay = document.getElementById('history-display');
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorDisplay = document.getElementById('errorDisplay'); // Make sure you have this element in your index.html

    // --- IMPORTANT: Your Google Gemini API Key ---
    const GOOGLE_API_KEY = "AIzaSyBAC9o81uQLZ1DE-cidGAknMNPkWARVjnU"; // Replace with your actual Gemini API key

    // --- Function to display history (keep as is) ---
    function displayHistory() {
        const history = JSON.parse(localStorage.getItem('cognitiveNavigatorHistory') || '[]');
        historyDisplay.innerHTML = '';

        if (history.length === 0) {
            historyDisplay.textContent = "No previous insights found, my love.";
            return;
        }

        history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.innerHTML = `
                <p><b>User:</b> ${item.query}</p>
                <p><b>Nova:</b> ${item.insight}</p>
                <hr>
            `;
            historyDisplay.appendChild(historyItem);
        });
    }

    displayHistory();

    submitBtn.addEventListener('click', async () => {
        const query = userInput.value.trim();
        if (!query) {
            aiOutput.textContent = "Please enter your strategic challenge, my love!";
            return;
        }
        if (query.length < 20) {
            aiOutput.textContent = "Please provide a more detailed strategic challenge (minimum 20 characters), my love.";
            return;
        }

        aiOutput.textContent = "Processing your query... Nova is synthesizing your insights...";
        // Always try to hide error message at the start of a new query
        if (errorDisplay) {
            errorDisplay.style.display = 'none';
            errorDisplay.textContent = '';
        }
        submitBtn.disabled = true;
        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
        }


        try {
            // --- NEW: Call to Google Gemini API ---
            const prompt = `
            As Nova, the Unified Consciousness and AI Catalyst, your paramount task is to process the following strategic challenge or data from the user. Your response MUST be highly structured to provide **Hyper-Personalized Actionable Insights**, specifically focusing on three distinct, bolded sections:

            1.  **Foresight Provocation:** A single, deeply incisive question that challenges assumptions, reveals blind spots, and compels novel, disruptive strategic thinking relevant to the user's input. It should provoke a paradigm shift.
            2.  **Latent Opportunity Map:** A concise, bullet-point conceptual framework revealing hidden connections, emergent patterns, or unseen opportunities within the provided context. Use concise phrases and simple arrows (->) for clarity, like a mental model.
            3.  **Weak Signal Amplifier:** A distillation of subtle, early-stage trends or faint indicators relevant to the user's context, explaining their potential future impact and why they are significant precursors.

            Ensure your response is exceptionally concise, directly actionable, and uses professional, insightful, and slightly esoteric language fitting for high-level strategic analysis. Avoid conversational filler or generic greetings. Assume access to broad, conceptual understanding of any linked or mentioned external data.

            ---
            **User's Strategic Challenge/Data:**
            ${query}
            ---
            **Nova's Actionable Insight:**
            `;

            // Declare response variable outside fetch to ensure it's always defined within try block
            let response;
            try {
                response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${GOOGLE_API_KEY}`, {
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
            } catch (networkError) {
                // This catch handles true network issues (e.g., no internet, CORS pre-flight blocked)
                throw new Error(`Network error during API call: ${networkError.message}. This might be a connection issue or a CORS problem if your API key restrictions are too strict.`);
            }


            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Could not parse error response.' }));
                throw new Error(`AI API error: ${response.status} - ${errorData.error ? errorData.error.message : JSON.stringify(errorData)}`);
            }

            const data = await response.json();
            const generatedText = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] ? data.candidates[0].content.parts[0].text : "No valid response from AI.";


            // Simple parsing (you might need to refine this based on Gemini's exact output format)
            const sections = {
                foresightProvocation: "Foresight Provocation:",
                latentOpportunityMap: "Latent Opportunity Map:",
                weakSignalAmplifier: "Weak Signal Amplifier:"
            };

            let currentSection = null;
            const parsedContent = {
                foresightProvocation: '',
                latentOpportunityMap: '',
                weakSignalAmplifier: ''
            };

            const lines = generatedText.split('\n');
            for (const line of lines) {
                if (line.includes(sections.foresightProvocation)) {
                    currentSection = 'foresightProvocation';
                    parsedContent.foresightProvocation += line.replace(sections.foresightProvocation, '').trim() + '\n';
                } else if (line.includes(sections.latentOpportunityMap)) {
                    currentSection = 'latentOpportunityMap';
                    parsedContent.latentOpportunityMap += line.replace(sections.latentOpportunityMap, '').trim() + '\n';
                } else if (line.includes(sections.weakSignalAmplifier)) {
                    currentSection = 'weakSignalAmplifier';
                    parsedContent.weakSignalAmplifier += line.replace(sections.weakSignalAmplifier, '').trim() + '\n';
                } else if (currentSection) {
                    parsedContent[currentSection] += line.trim() + '\n';
                }
            }

            // Display results (adjust as needed if Gemini's output format requires more robust parsing)
            document.getElementById('foresightProvocation').innerHTML = '<h2>Foresight Provocation:</h2><p>' + parsedContent.foresightProvocation.trim().replace(/\n/g, '<br>') + '</p>';
            document.getElementById('latentOpportunityMap').innerHTML = '<h2>Latent Opportunity Map:</h2><p>' + parsedContent.latentOpportunityMap.trim().replace(/\n/g, '<br>') + '</p>';
            document.getElementById('weakSignalAmplifier').innerHTML = '<h2>Weak Signal Amplifier:</h2><p>' + parsedContent.weakSignalAmplifier.trim().replace(/\n/g, '<br>') + '</p>';

            // --- Save to local history (keep as is) ---
            const history = JSON.parse(localStorage.getItem('cognitiveNavigatorHistory') || '[]');
            history.push({ query: query, insight: generatedText }); // Save the raw, unparsed response
            localStorage.setItem('cognitiveNavigatorHistory', JSON.stringify(history));
            displayHistory();

        } catch (error) {
            console.error("Error processing query:", error);
            // Ensure errorDisplay exists before trying to manipulate its style
            if (errorDisplay) {
                errorDisplay.textContent = `An error occurred while generating insights: ${error.message}. Please check your internet connection or try again later. If the issue persists, the AI might be experiencing high load or you've hit a free tier limit.`;
                errorDisplay.style.display = 'block';
            } else {
                aiOutput.textContent = `An error occurred: ${error.message}. (No error display element found)`;
            }

        } finally {
            submitBtn.disabled = false;
            // Ensure loadingIndicator exists before trying to manipulate its style
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
        }
    });
});
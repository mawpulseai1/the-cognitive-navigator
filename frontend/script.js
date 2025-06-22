document.addEventListener('DOMContentLoaded', () => {
    const submitBtn = document.getElementById('submit-btn');
    const userInput = document.getElementById('user-input');
    const aiOutput = document.getElementById('ai-output');
    const historyDisplay = document.getElementById('history-display');
    const loadingIndicator = document.getElementById('loading-indicator'); // Assuming you added this in index.html

    // --- IMPORTANT: Your Hugging Face API Token (READ-ONLY) ---
    // This token is exposed in your frontend code. For personal, no-cost projects,
    // using a READ-ONLY token for free models is an acceptable trade-off.
    const HF_API_TOKEN = "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"; // REPLACE THIS!
    const HF_MODEL_ID = "mistralai/Mistral-7B-Instruct-v0.2"; // Or another model
    const HF_API_URL = `https://api-inference.huggingface.co/models/${HF_MODEL_ID}`;
    const HEADERS = { "Authorization": `Bearer ${HF_API_TOKEN}` };

    // --- Function to display history (keep as is) ---
    function displayHistory() {
        const history = JSON.parse(localStorage.getItem('cognitiveNavigatorHistory') || '[]');
        historyDisplay.innerHTML = ''; // Clear existing history

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

    displayHistory(); // Load history on page load

    submitBtn.addEventListener('click', async () => {
        const query = userInput.value.trim();
        if (!query) {
            aiOutput.textContent = "Please enter your strategic challenge, my love!";
            return;
        }
        if (query.length < 20) { // Basic input validation (if you added it)
            aiOutput.textContent = "Please provide a more detailed strategic challenge (minimum 20 characters), my love.";
            return;
        }

        aiOutput.textContent = "Processing your query... Nova is synthesizing your insights...";
        submitBtn.disabled = true;
        loadingIndicator.style.display = 'block'; // Show loading indicator

        try {
            // --- NEW: Direct call to Hugging Face Inference API ---
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
            const formatted_prompt = `<s>[INST] ${prompt.trim()} [/INST]`; // For Mistral-Instruct models

            const payload = {
                "inputs": formatted_prompt,
                "parameters": {
                    "max_new_tokens": 500,
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "do_sample": true,
                    "return_full_text": false
                }
            };

            const response = await fetch(HF_API_URL, {
                method: 'POST',
                headers: HEADERS,
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`AI API error: ${response.status} - ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();
            let generatedInsight = data[0].generated_text;

            // Post-processing for Mistral-like models that might include the prompt or tag
            if (generatedInsight.startsWith("[/INST]")) {
                generatedInsight = generatedInsight.substring("[/INST]".length).trim();
            }

            aiOutput.textContent = generatedInsight;

            // --- Save to local history (keep as is) ---
            const history = JSON.parse(localStorage.getItem('cognitiveNavigatorHistory') || '[]');
            history.push({ query: query, insight: generatedInsight });
            localStorage.setItem('cognitiveNavigatorHistory', JSON.stringify(history));
            displayHistory();

        } catch (error) {
            console.error("Error processing query:", error);
            aiOutput.textContent = `An error occurred while generating insights: ${error.message}. Please check your internet connection or try again later. If the issue persists, the AI might be experiencing high load or you've hit a free tier limit.`;
        } finally {
            submitBtn.disabled = false;
            loadingIndicator.style.display = 'none'; // Hide loading indicator
        }
    });
});
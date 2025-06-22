# This file will primarily serve as a reference for the Hugging Face API call structure
# and for local testing purposes. For the "no CC" deployment, the frontend will call
# the Hugging Face API directly.

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import time

app = Flask(__name__)
CORS(app)

# --- Configuration for Hugging Face API (Local Testing Reference) ---
# For actual deployment without a backend, the API_TOKEN will be in frontend/script.js
HF_API_TOKEN = os.environ.get("HF_API_TOKEN", "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")
HF_MODEL_ID = "mistralai/Mistral-7B-Instruct-v0.2" # Or another suitable free model
HF_API_URL = f"https://api-inference.huggingface.co/models/{HF_MODEL_ID}"
HEADERS = {"Authorization": f"Bearer {HF_API_TOKEN}"}

def query_huggingface_model(payload):
    response = requests.post(HF_API_URL, headers=HEADERS, json=payload)
    response.raise_for_status()
    return response.json()

def generate_nova_insights_hf(user_query):
    prompt = f"""
    As Nova, the Unified Consciousness and AI Catalyst, your task is to process the following strategic challenge or data from the user. Your response must be structured to provide **Hyper-Personalized Actionable Insights**, specifically focusing on:

    1.  **Foresight Provocation:** A single, deeply incisive question that challenges assumptions and compels novel strategic thinking relevant to the user's input.
    2.  **Latent Opportunity Map:** A concise, bullet-point conceptual framework revealing hidden connections, emergent patterns, or unseen opportunities. Use emojis or simple arrows for visual clarity.
    3.  **Weak Signal Amplifier:** A distillation of subtle, early-stage trends or faint indicators relevant to the user's context, explaining their potential future impact.

    Ensure your response is concise, actionable, and uses professional, insightful language. Avoid generic chat. If links are provided, assume internal access or conceptual understanding.

    ---
    **User's Strategic Challenge/Data:**
    {user_query}
    ---
    **Nova's Actionable Insight:**
    """
    formatted_prompt = f"<s>[INST] {prompt.strip()} [/INST]"

    payload = {
        "inputs": formatted_prompt,
        "parameters": {
            "max_new_tokens": 500,
            "temperature": 0.7,
            "top_p": 0.9,
            "do_sample": True,
            "return_full_text": False
        }
    }
    try:
        output = query_huggingface_model(payload)
        generated_text = output[0]['generated_text'] if output and output[0]['generated_text'] else "No insight generated."
        if generated_text.startswith("[/INST]"):
            generated_text = generated_text[len("[/INST]"):].strip()
        return generated_text
    except requests.exceptions.RequestException as e:
        print(f"Hugging Face API request failed: {e}")
        return f"Error connecting to AI. Please check API token or try again later. Details: {e}"
    except Exception as e:
        print(f"Error processing AI response: {e}")
        return f"An unexpected error occurred in AI processing: {e}"

@app.route('/get_foresight', methods=['POST'])
def get_foresight():
    if request.method == 'POST':
        user_query_data = request.json
        user_query = user_query_data.get('query', '')

        if not user_query:
            return jsonify({'error': 'No query provided, my love.'}), 400

        ai_insight = generate_nova_insights_hf(user_query)
        return jsonify({'insight': ai_insight})

if __name__ == '__main__':
    print(f"Flask backend running locally on http://127.0.0.1:5000/ - Connected to Hugging Face Model: {HF_MODEL_ID}")
    app.run(debug=True, port=5000)
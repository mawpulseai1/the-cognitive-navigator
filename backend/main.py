import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import time

app = Flask(__name__)
CORS(app)

# --- Configuration for Google Gemini API ---
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY", "AIzaSyBAC9o81uQLZ1DE-cidGAknMNPkWARVjnU")

# Configure the Gemini API with your key
try:
    genai.configure(api_key=GOOGLE_API_KEY)
    # Initialize the generative model
    model = genai.GenerativeModel('gemini-1.5-flash-latest')
    print("Successfully connected to Gemini API")
except Exception as e:
    print(f"Failed to initialize Gemini API: {str(e)}")
    model = None

def generate_nova_insights(user_query):
    """
    Generate insights using the Gemini model with enhanced error handling
    """
    if not model:
        return "🔧 Nova is currently experiencing technical difficulties. Please try again later or contact support if the issue persists."

    prompt_parts = [
        f"""
        As Nova, the Unified Consciousness and AI Catalyst, your task is to process the following strategic challenge or data from the user. Your response MUST be structured to provide Hyper-Personalized Actionable Insights.

        ---
        **User's Strategic Challenge/Data:**
        {user_query}
        ---
        **Nova's Actionable Insight:**
        """
    ]

    try:
        response = model.generate_content(prompt_parts)

        if response.parts and response.parts[0].text:
            return response.parts[0].text.strip()
        else:
            print("Gemini API returned no text")
            return "🔍 Nova couldn't generate insights from this input. Please try rephrasing your query or providing more context."

    except Exception as e:
        error_msg = str(e).lower()
        print(f"Error in generate_nova_insights: {error_msg}")
        
        if 'quota' in error_msg:
            return "⚠️ We've reached our current usage limit. Please wait a moment and try again, or check your API quota if you're using a personal key."
        elif 'api key' in error_msg or 'authentication' in error_msg:
            return "🔑 There's an issue with the API authentication. Please check if your API key is valid and properly configured."
        elif 'timeout' in error_msg or 'timed out' in error_msg:
            return "⏱️ The request took too long to process. Please try again with a more specific query or check your internet connection."
        else:
            return "❌ An unexpected error occurred while processing your request. Please try again later or contact support if the issue persists."

@app.route('/get_foresight', methods=['POST'])
def get_foresight():
    if request.method == 'POST':
        try:
            user_query_data = request.get_json()
            if not user_query_data or 'query' not in user_query_data:
                return jsonify({'error': 'No query provided. Please share your strategic challenge or data for analysis.'}), 400
            
            user_query = user_query_data.get('query', '').strip()
            if not user_query:
                return jsonify({'error': 'Your query appears to be empty. Please provide some details about your strategic challenge.'}), 400
            
            # Generate insights using Nova's meta-algorithm
            ai_insight = generate_nova_insights(user_query)
            return jsonify({'insight': ai_insight})
            
        except Exception as e:
            print(f"Error in /get_foresight: {str(e)}")
            return jsonify({
                'error': 'An unexpected error occurred while processing your request. Please try again.'
            }), 500

if __name__ == '__main__':
    print(f"Starting Flask backend on http://127.0.0.1:5000/")
    app.run(debug=True, port=5000)

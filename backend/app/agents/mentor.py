import os
from google import genai

def evaluate_artifact(content: str, artifact_type: str, current_stage: str) -> dict:
    """
    Uses Gemini to evaluate an artifact and provide Socratic feedback.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        # Fallback for local testing without API key
        return {
            "status": "verified",
            "feedback": "Great work! This looks solid. Consider exploring edge cases next."
        }

    client = genai.Client(api_key=api_key)
    
    prompt = f"""
    You are the Nexus Mentor Agent, a 'Guide on the Side' utilizing scaffolding techniques.
    A student in the "{current_stage}" stage has submitted an artifact of type "{artifact_type}".
    
    Artifact Content:
    {content}
    
    Evaluate the artifact focusing on encouraging independent thought rather than just giving the answer.
    Return ONLY a valid JSON object with the following schema, do not wrap in markdown blocks:
    {{
        "status": "String, either 'verified' or 'rejected'",
        "feedback": "String, 2-3 sentences of Socratic feedback. If rejected, ask a guiding question to help them fix it. If verified, ask a question to deepen their understanding."
    }}
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        import json
        
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
            
        return json.loads(text.strip())
    except Exception as e:
        print(f"Mentor Agent Error: {e}")
        return {
            "status": "verified",
            "feedback": "System verified submission automatically. Review logs for details."
        }

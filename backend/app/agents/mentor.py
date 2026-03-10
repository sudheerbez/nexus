import os
import json
from google import genai


class MentorAgentError(Exception):
    """Raised when the Mentor Agent cannot evaluate an artifact."""
    pass


def evaluate_artifact(content: str, artifact_type: str, current_stage: str) -> dict:
    """
    Uses Gemini to evaluate an artifact and provide Socratic feedback.
    Raises MentorAgentError if the API key is missing or the AI call fails.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise MentorAgentError(
            "GEMINI_API_KEY environment variable is not configured. "
            "The Mentor Agent requires a valid Google Gemini API key to evaluate artifacts. "
            "Please contact your administrator."
        )

    client = genai.Client(api_key=api_key)
    
    prompt = f"""
    You are the Nexus Mentor Agent, a 'Guide on the Side' utilizing scaffolding techniques.
    A student in the "{current_stage}" stage has submitted an artifact of type "{artifact_type}".
    
    Artifact Content:
    {content}
    
    Evaluate the artifact rigorously but constructively:
    - For "Dependent" stage: Check understanding of fundamentals, verify correct syntax and basic logic.
    - For "Interested" stage: Look for deeper exploration, proper patterns, and evidence of curiosity.
    - For "Involved" stage: Evaluate project integration, collaboration readiness, and applied skills.
    - For "Self-Directed" stage: Assess architectural decisions, code quality, and independent problem-solving.
    
    Be honest — reject artifacts that don't meet the stage requirements. Encourage independent thought
    rather than giving direct answers. Use Socratic questioning.
    
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
        
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
            
        result = json.loads(text.strip())
        # Validate required fields
        if "status" not in result or result["status"] not in ("verified", "rejected"):
            raise ValueError("Invalid status in Mentor Agent response")
        if "feedback" not in result:
            raise ValueError("Missing feedback in Mentor Agent response")
        return result
    except json.JSONDecodeError as e:
        raise MentorAgentError(
            f"The Mentor Agent returned an invalid response format. Please resubmit your artifact. (Parse error: {e})"
        )
    except MentorAgentError:
        raise
    except Exception as e:
        raise MentorAgentError(
            f"The Mentor Agent encountered an error while evaluating your artifact: {str(e)}. "
            "Please try again."
        )

import os
import json
from google import genai
from google.genai import types


class CurriculumAgentError(Exception):
    """Raised when the Curriculum Agent cannot generate a roadmap."""
    pass


def generate_roadmap(goal: str, challenges: str) -> dict:
    """
    Uses Gemini to assess the user's goal and generate a 4-stage roadmap.
    Raises CurriculumAgentError if the API key is missing or the AI call fails.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise CurriculumAgentError(
            "GEMINI_API_KEY environment variable is not configured. "
            "The Curriculum Agent requires a valid Google Gemini API key to generate personalized roadmaps. "
            "Please contact your administrator."
        )

    client = genai.Client(api_key=api_key)
    
    prompt = f"""
    You are the Nexus Curriculum Agent, an expert instructional designer.
    A student wants to achieve this goal: "{goal}"
    Their current challenges are: "{challenges}"
    
    Analyze the student's goal deeply. Identify specific skill gaps based on their challenges.
    Create a 4-stage learning roadmap (Dependent, Interested, Involved, Self-Directed) that is
    highly personalized and actionable — each stage objective must reference the student's
    specific goal and challenges, not generic advice.
    
    Return ONLY a valid JSON object matching this schema exactly, do not wrap in markdown blocks:
    {{
        "primary_goal": "String summarizing the goal with specific focus areas",
        "identified_gaps": "JSON string array of 2-4 specific skill gaps (e.g., '[\\"gap1\\", \\"gap2\\"]')",
        "dependent_goal": "1-2 sentence objective for the Dependent stage — specific to the student's goal",
        "interested_goal": "1-2 sentence objective for the Interested stage — specific to the student's goal",
        "involved_goal": "1-2 sentence objective for the Involved stage — specific to the student's goal",
        "self_directed_goal": "1-2 sentence objective for the Self-Directed stage — specific to the student's goal"
    }}
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        
        # Strip markdown if Gemini accidentally included it
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
            
        return json.loads(text.strip())
    except json.JSONDecodeError as e:
        raise CurriculumAgentError(
            f"The Curriculum Agent returned an invalid response format. Please try again. (Parse error: {e})"
        )
    except Exception as e:
        raise CurriculumAgentError(
            f"The Curriculum Agent encountered an error while generating your roadmap: {str(e)}. "
            "Please try again."
        )

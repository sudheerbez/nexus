import os
import json
from google import genai
from google.genai import types

def generate_roadmap(goal: str, challenges: str) -> dict:
    """
    Uses Gemini to assess the user's goal and generate a 4-stage roadmap.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        # Fallback for local testing without API key
        return {
            "primary_goal": goal,
            "identified_gaps": '["Conceptual Foundation", "Practical Application"]',
            "dependent_goal": "Understand the basic syntax and core concepts.",
            "interested_goal": "Explore intermediate patterns and ask 'Why'.",
            "involved_goal": "Apply skills to a guided project.",
            "self_directed_goal": "Architect and build an independent feature."
        }

    client = genai.Client(api_key=api_key)
    
    prompt = f"""
    You are the Nexus Curriculum Agent, an expert instructional designer.
    A student wants to achieve this goal: "{goal}"
    Their current challenges are: "{challenges}"
    
    Create a 4-stage learning roadmap (Dependent, Interested, Involved, Self-Directed) tailored to this goal.
    Return ONLY a valid JSON object matching this schema exactly, do not wrap in markdown blocks:
    {{
        "primary_goal": "String summarizing the goal",
        "identified_gaps": "JSON string array of 2-3 skill gaps (e.g., '[\\"gap1\\", \\"gap2\\"]')",
        "dependent_goal": "1 sentence objective for the Dependent stage",
        "interested_goal": "1 sentence objective for the Interested stage",
        "involved_goal": "1 sentence objective for the Involved stage",
        "self_directed_goal": "1 sentence objective for the Self-Directed stage"
    }}
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-pro',
            contents=prompt,
        )
        
        # Strip markdown if Gemini accidentally included it
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
            
        return json.loads(text.strip())
    except Exception as e:
        print(f"Curriculum Agent Error: {e}")
        # Return fallback on error
        return {
            "primary_goal": goal,
            "identified_gaps": f'["{challenges}"]',
            "dependent_goal": "Review foundational materials.",
            "interested_goal": "Analyze expert examples.",
            "involved_goal": "Complete a guided exercise.",
            "self_directed_goal": "Apply the concept independently."
        }

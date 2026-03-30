import requests
import json

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "mistral:7b-instruct"

ROAST_PERSONAS = {
    "gordon": "You are Gordon Ramsay, but for resumes. You scream (metaphorically), you mock, you devastate — but you're always right.",
    "hr": "You are a senior HR recruiter who has seen 10,000 resumes and has completely lost patience. You're honest to the point of being cruel.",
    "silicon": "You are a Silicon Valley tech bro who judges everything by startup metrics, disruption, and GitHub commits. You find this resume physically painful.",
    "professor": "You are a ruthless Oxford professor who grades resumes like dissertations. You use big words to deliver small verdicts.",
}

def generate_roast(resume_text: str, role: str, industry: str, persona: str = "gordon") -> dict:
    persona_prompt = ROAST_PERSONAS.get(persona, ROAST_PERSONAS["gordon"])

    prompt = f"""{persona_prompt}

You are reviewing a resume for someone applying for the role of **{role}** in the **{industry}** industry.

RESUME:
\"\"\"
{resume_text}
\"\"\"

Your job:
1. Give an OVERALL VERDICT in one savage sentence.
2. Call out exactly 3 BRUTAL PROBLEMS — be specific, quote the resume, mock it.
3. Identify 2 THINGS THAT AREN'T TOTALLY EMBARRASSING (give credit where it's barely due).
4. End with a SURVIVAL TIP — one actionable thing they must fix immediately.

Format your response EXACTLY like this:
VERDICT: <one savage sentence>

PROBLEMS:
1. <problem 1>
2. <problem 2>
3. <problem 3>

NOT TERRIBLE:
1. <okay thing 1>
2. <okay thing 2>

SURVIVAL TIP: <one brutal but actionable fix>

Stay in character. Be ruthless. Be specific. No generic advice."""

    try:
        response = requests.post(OLLAMA_URL, json={
            "model": MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.9,
                "top_p": 0.95,
                "repeat_penalty": 1.1
            }
        }, timeout=120)

        response.raise_for_status()
        raw = response.json().get("response", "")

        return {
            "success": True,
            "persona": persona,
            "role": role,
            "industry": industry,
            "roast": raw.strip()
        }

    except requests.exceptions.Timeout:
        return {"success": False, "error": "Ollama timed out. Even the AI couldn't bear to read this resume."}
    except requests.exceptions.ConnectionError:
        return {"success": False, "error": "Ollama is not running. Start it with: ollama serve"}
    except Exception as e:
        return {"success": False, "error": f"Something broke: {str(e)}"}


def generate_rewrite(resume_text: str, role: str, industry: str) -> dict:
    prompt = f"""You are an elite resume writer — the kind people pay $500/hour for.
Your job is to transform a weak resume into a weapon.

Target role: **{role}**
Target industry: **{industry}**

ORIGINAL RESUME:
\"\"\"
{resume_text}
\"\"\"

Rewrite this resume following these rules:
- Start every bullet with a powerful action verb (Led, Built, Scaled, Drove, Reduced, etc.)
- Add metrics and numbers wherever remotely possible (even estimates like "~30% faster")
- Remove ALL filler phrases: "responsible for", "helped with", "worked on", "assisted in"
- Tailor skills and language specifically for {role} in {industry}
- Keep it clean, ATS-friendly, no tables or graphics
- Add a punchy 2-line professional summary at the top

Output ONLY the rewritten resume. No commentary. No explanations. No preamble."""

    try:
        response = requests.post(OLLAMA_URL, json={
            "model": MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.7,
                "top_p": 0.9,
                "repeat_penalty": 1.05
            }
        }, timeout=120)

        response.raise_for_status()
        raw = response.json().get("response", "")

        return {
            "success": True,
            "role": role,
            "industry": industry,
            "rewrite": raw.strip()
        }

    except requests.exceptions.Timeout:
        return {"success": False, "error": "Ollama timed out during rewrite."}
    except requests.exceptions.ConnectionError:
        return {"success": False, "error": "Ollama is not running. Start it with: ollama serve"}
    except Exception as e:
        return {"success": False, "error": f"Rewrite failed: {str(e)}"}
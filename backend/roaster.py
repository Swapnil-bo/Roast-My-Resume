import requests
import json

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "mistral:7b-instruct"

def generate_roast(resume_text: str, role: str, industry: str) -> str:
    prompt = f"""You are a brutally honest, witty career coach who roasts resumes like Gordon Ramsay roasts bad chefs. 
You are reviewing a resume for someone targeting the role of {role} in the {industry} industry.

Here is the resume:
{resume_text}

Give a savage but constructive roast. Call out every weak point — vague buzzwords, missing metrics, poor structure, irrelevant experience, red flags. 
Be funny, be brutal, but be specific. No sugarcoating. 3-5 paragraphs."""

    response = requests.post(OLLAMA_URL, json={
        "model": MODEL,
        "prompt": prompt,
        "stream": False
    })

    return response.json().get("response", "Roast failed. Even the AI gave up on this resume.")


def generate_rewrite(resume_text: str, role: str, industry: str) -> str:
    prompt = f"""You are an expert resume writer. Rewrite the following resume for someone targeting the role of {role} in the {industry} industry.

Original resume:
{resume_text}

Rewrite it with:
- Strong action verbs
- Quantified achievements where possible
- Clean, ATS-friendly structure
- Relevant skills highlighted for {role} in {industry}

Output only the rewritten resume. No commentary."""

    response = requests.post(OLLAMA_URL, json={
        "model": MODEL,
        "prompt": prompt,
        "stream": False
    })

    return response.json().get("response", "Rewrite failed. Start from scratch.")
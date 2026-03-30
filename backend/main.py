from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import pdfplumber
import io
from roaster import stream_roast, stream_rewrite

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def extract_text_from_pdf(file_bytes: bytes) -> str:
    text = ""
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text.strip()


@app.post("/roast")
async def roast_resume(
    file: UploadFile = File(...),
    role: str = Form(...),
    industry: str = Form(...),
    persona: str = Form(default="gordon"),
):
    file_bytes = await file.read()
    resume_text = extract_text_from_pdf(file_bytes)

    return StreamingResponse(
        stream_roast(resume_text, role, industry, persona),
        media_type="text/event-stream",
        headers={"X-Accel-Buffering": "no"},
    )


@app.post("/rewrite")
async def rewrite_resume(
    file: UploadFile = File(...),
    role: str = Form(...),
    industry: str = Form(...),
):
    file_bytes = await file.read()
    resume_text = extract_text_from_pdf(file_bytes)

    return StreamingResponse(
        stream_rewrite(resume_text, role, industry),
        media_type="text/event-stream",
        headers={"X-Accel-Buffering": "no"},
    )


@app.get("/health")
def health():
    return {"status": "alive"}

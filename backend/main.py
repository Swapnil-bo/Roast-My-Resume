from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
import pdfplumber
import requests
import io
import time
import logging
from roaster import stream_roast, stream_rewrite

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger(__name__)

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="Roast My Resume API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Constants ─────────────────────────────────────────────────────────────────
MAX_FILE_SIZE_MB = 5
MAX_RESUME_CHARS = 8000  # Mistral context cap — trim beyond this


# ── Helpers ───────────────────────────────────────────────────────────────────
def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        text = ""
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text.strip()[:MAX_RESUME_CHARS]
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not parse PDF: {str(e)}")


def validate_file(file: UploadFile, file_bytes: bytes):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")
    size_mb = len(file_bytes) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(status_code=400, detail=f"File too large. Max size is {MAX_FILE_SIZE_MB}MB.")


# ── Middleware: Request Timer ─────────────────────────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = round(time.time() - start, 2)
    logger.info(f"{request.method} {request.url.path} → {response.status_code} ({duration}s)")
    return response


# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "alive", "model": "mistral:7b-instruct", "version": "1.0.0"}


@app.get("/models")
def get_available_models():
    """Check which models are available in local Ollama."""
    try:
        res = requests.get("http://localhost:11434/api/tags", timeout=5)
        models = [m["name"] for m in res.json().get("models", [])]
        return {"available_models": models}
    except Exception:
        raise HTTPException(status_code=503, detail="Ollama is not running. Start it with: ollama serve")


@app.post("/roast")
async def roast_resume(
    file: UploadFile = File(...),
    role: str = Form(...),
    industry: str = Form(...),
    persona: str = Form(default="gordon"),
):
    file_bytes = await file.read()
    validate_file(file, file_bytes)
    resume_text = extract_text_from_pdf(file_bytes)

    logger.info(f"Roasting resume | role={role} | industry={industry} | persona={persona} | chars={len(resume_text)}")

    return StreamingResponse(
        stream_roast(resume_text, role, industry, persona),
        media_type="text/event-stream",
        headers={"X-Accel-Buffering": "no", "Cache-Control": "no-cache"},
    )


@app.post("/rewrite")
async def rewrite_resume(
    file: UploadFile = File(...),
    role: str = Form(...),
    industry: str = Form(...),
):
    file_bytes = await file.read()
    validate_file(file, file_bytes)
    resume_text = extract_text_from_pdf(file_bytes)

    logger.info(f"Rewriting resume | role={role} | industry={industry} | chars={len(resume_text)}")

    return StreamingResponse(
        stream_rewrite(resume_text, role, industry),
        media_type="text/event-stream",
        headers={"X-Accel-Buffering": "no", "Cache-Control": "no-cache"},
    )


# ── Error Handlers ────────────────────────────────────────────────────────────
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"success": False, "error": exc.detail})

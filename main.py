from fastapi import FastAPI
from routes import router

app = FastAPI(title="ReviewMate AI Backend", version="1.0.0")

app.include_router(router)


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "reviewmate-ai-backend"
    }

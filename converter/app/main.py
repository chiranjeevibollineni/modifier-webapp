from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import conversions

app = FastAPI(title="PeoplePulse Conversion Core")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://peoplepulse.online"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(conversions.router)

@app.get("/")
def read_root():
    return {"status": "online", "engine": "FastAPI Core Active"}

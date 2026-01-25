from fastapi import FastAPI
from app.db.database import Base, engine
from app.models import user, doctor

app = FastAPI(title="Smart Queue System")

Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "Backend is running"}

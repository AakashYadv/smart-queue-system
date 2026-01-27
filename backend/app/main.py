from fastapi import FastAPI
from app.db.database import Base, engine
from app.routes import user , auth
app = FastAPI()


Base.metadata.create_all(bind=engine)
app.include_router(user.router)
app.include_router(auth.router)

@app.get("/")
def health():
    return {"message": "Backend is running"}

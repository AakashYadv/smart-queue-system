# from fastapi import FastAPI
# from app.db.database import Base, engine
# from app.routes import user , auth,admin,doctor,patient
# app = FastAPI()


# Base.metadata.create_all(bind=engine)
# app.include_router(user.router)
# app.include_router(auth.router)
# app.include_router(admin.router)
# app.include_router(doctor.router)
# app.include_router(patient.router)

# @app.get("/")
# def health():
#     return {"message": "Backend is running"}

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import Base, engine
from app.routes import user, auth, admin, doctor, patient

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(user.router)
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(doctor.router)
app.include_router(patient.router)

@app.get("/")
def health():
    return {"message": "Backend is running"}

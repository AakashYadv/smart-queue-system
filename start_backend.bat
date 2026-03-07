@echo off
echo Starting Smart Queue Backend...
cd backend
C:\Users\aky47\AppData\Local\Programs\Python\Python311\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

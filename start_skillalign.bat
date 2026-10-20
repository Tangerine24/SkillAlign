@echo off
title SkillAlign Prototype Launcher (SIH26246)
echo ========================================================
echo  SkillAlign: AI-Enabled Labour Market Intelligence
echo  Ministry of Skill Development & Entrepreneurship (MSDE)
echo  Madhya Pradesh Pilot (5 Districts x 6 Occupations)
echo ========================================================
echo.

echo [1/2] Starting FastAPI Backend on port 8000...
start "SkillAlign Backend (Port 8000)" cmd /k "cd /d C:\Users\Lenovo\.gemini\antigravity\scratch\SkillAlign\backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/2] Starting React + Vite Frontend on port 5173...
start "SkillAlign Frontend (Port 5173)" cmd /k "cd /d C:\Users\Lenovo\.gemini\antigravity\scratch\SkillAlign\frontend && npm.cmd run dev"

echo.
echo Both servers are launching!
echo  - Frontend: http://localhost:5173
echo  - Backend API: http://localhost:8000
echo  - OpenAPI Docs: http://localhost:8000/docs
echo.

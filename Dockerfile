# ==========================================
# Multi-Stage Build: ExportPilot AI
# Stage 1: Build React Frontend (Vite)
# ==========================================
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ==========================================
# Stage 2: Production Python 3.11 Runtime
# ==========================================
FROM python:3.11-slim

WORKDIR /app

# System dependencies for OpenCV, PyMuPDF, ReportLab
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Backend, Scripts, and Built Frontend
COPY backend/ ./backend/
COPY scripts/ ./scripts/
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
COPY frontend/public ./frontend/public

# Generate all visual assets and seed SQLite database
RUN python scripts/generate_all_assets.py

# Expose Port 8000 (Unified FastAPI + React SPA)
EXPOSE 8000

ENV PORT=8000
ENV HOST=0.0.0.0
ENV PYTHONUNBUFFERED=1

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]

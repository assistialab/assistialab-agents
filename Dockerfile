FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Create non-root user
RUN useradd -m -u 10001 appuser
WORKDIR /app

# Install deps
COPY requirements.txt ./
RUN pip install -r requirements.txt

# Copy code and install
COPY . .
RUN pip install -e .

# Drop privileges
USER appuser

# Run FastAPI
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD python - <<'PY' || exit 1
import urllib.request, sys
try:
    with urllib.request.urlopen("http://127.0.0.1:8000/health", timeout=2) as r:
        sys.exit(0 if r.status==200 else 1)
except Exception:
    sys.exit(1)
PY
CMD ["uvicorn", "assistialab_agents.app:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

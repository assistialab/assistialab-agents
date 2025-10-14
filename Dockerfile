FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install deps (layer-cached)
COPY requirements.txt ./
RUN pip install -r requirements.txt

# Copy source and install
COPY . .
RUN pip install -e .

EXPOSE 8000

# Simple healthcheck
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD python -c "import urllib.request,sys; \
    url='http://127.0.0.1:8000/health'; \
    \
    import contextlib; \
    with contextlib.suppress(Exception): \
        r=urllib.request.urlopen(url, timeout=2); \
        sys.exit(0 if r.status==200 else 1); \
    sys.exit(1)"

CMD ["uvicorn", "assistialab_agents.app:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

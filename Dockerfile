FROM python:3.12-slim

# Basics & sane defaults
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install Python deps first (better layer caching)
COPY requirements.txt ./
RUN pip install -r requirements.txt

# Copy source and install the package
COPY . .
RUN pip install -e .

# Minimal smoke command (prints a greeting)
CMD ["python", "-c", "import assistialab_agents as a; print(a.hello('Docker'))"]

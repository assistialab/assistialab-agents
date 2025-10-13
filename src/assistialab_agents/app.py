from fastapi import FastAPI
from fastapi.responses import HTMLResponse
import os

# import package version
try:
    from assistialab_agents import __version__ as PKG_VERSION
except Exception:
    PKG_VERSION = "unknown"

app = FastAPI(title="Assistialab Agents")

@app.get("/", response_class=HTMLResponse)
def root():
    return """<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><title>Assistialab Agents</title></head>
  <body style="font-family: system-ui; max-width: 640px; margin: 3rem auto;">
    <h1>Assistialab Agents</h1>
    <p>Welcome 👋 This service is running inside Docker.</p>
    <ul>
      <li><a href="/health">/health</a> – basic health check</li>
      <li><a href="/hello?name=Assistialab">/hello?name=Assistialab</a> – demo endpoint</li>
      <li><a href="/version">/version</a> – service version info</li>
    </ul>
  </body>
</html>"""

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/hello")
def hello(name: str = "World"):
    return {"message": f"Hello, {name}!"}

@app.get("/version")
def version():
    # Optionally injected by docker compose environment
    git_sha = os.getenv("GIT_SHA", "unknown")
    git_tag = os.getenv("GIT_TAG", "unknown")
    return {
        "service": "assistialab-agents",
        "package_version": PKG_VERSION,
        "git": {"tag": git_tag, "sha": git_sha},
    }

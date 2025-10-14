from __future__ import annotations
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import HTMLResponse
from typing import List, Optional
import os

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
      <li><a href="/health">/health</a></li>
      <li><a href="/hello?name=Assistialab">/hello?name=Assistialab</a></li>
      <li><a href="/version">/version</a></li>
      <li><a href="/agents">/agents</a></li>
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
    git_sha = os.getenv("GIT_SHA", "unknown")
    git_tag = os.getenv("GIT_TAG", "unknown")
    return {
        "service": "assistialab-agents",
        "package_version": PKG_VERSION,
        "git": {"tag": git_tag, "sha": git_sha},
    }

# ---- Agents API ----
from .agents.registry import list_agents, get as get_agent, run_demo  # noqa: E402
from .agents import catalog  # noqa: F401,E402  (registers agents on import)

@app.get("/agents")
def agents(q: Optional[str] = None, tags: Optional[List[str]] = Query(default=None)):
    items = list_agents(q=q, tags=tags)
    return [
        {
            "slug": a.slug,
            "title": a.title,
            "summary": a.summary,
            "badges": a.badges,
            "kinds": a.kinds,
            "status": a.status,
            "docs_url": a.docs_url,
        }
        for a in items
    ]

@app.get("/agents/{slug}")
def agent_detail(slug: str):
    try:
        a = get_agent(slug)
        return {
            "slug": a.slug,
            "title": a.title,
            "summary": a.summary,
            "badges": a.badges,
            "kinds": a.kinds,
            "status": a.status,
            "docs_url": a.docs_url,
        }
    except KeyError:
        raise HTTPException(status_code=404, detail="Agent not found")

@app.post("/agents/{slug}/demo")
def agent_demo(slug: str, payload: dict):
    if not isinstance(payload, dict):
        raise HTTPException(status_code=400, detail="Payload must be a JSON object")
    res = run_demo(slug, payload)
    if not res.get("ok"):
        raise HTTPException(status_code=400, detail=res.get("error", "demo failed"))
    return res

from __future__ import annotations
from typing import Dict, List, Any
from .models import Agent

REGISTRY: Dict[str, Agent] = {}

def register(agent: Agent) -> None:
    if agent.slug in REGISTRY:
        raise ValueError(f"Agent slug already exists: {agent.slug}")
    REGISTRY[agent.slug] = agent

def list_agents(q: str | None = None, tags: List[str] | None = None) -> List[Agent]:
    items = list(REGISTRY.values())
    if q:
        ql = q.lower()
        items = [a for a in items if ql in a.title.lower() or ql in a.summary.lower()]
    if tags:
        tagset = {t.lower() for t in tags}
        items = [a for a in items if tagset.intersection({k.lower() for k in a.kinds})]
    return items

def get(slug: str) -> Agent:
    if slug not in REGISTRY:
        raise KeyError(slug)
    return REGISTRY[slug]

def run_demo(slug: str, payload: dict[str, Any]) -> dict[str, Any]:
    agent = get(slug)
    if not agent.demo_fn:
        return {"ok": False, "error": "Demo not implemented for this agent."}
    try:
        return {"ok": True, "data": agent.demo_fn(payload)}
    except Exception as e:
        return {"ok": False, "error": str(e)}

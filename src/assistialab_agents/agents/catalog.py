from __future__ import annotations
from .models import Agent
from .registry import register

def echo_demo(payload):
    name = payload.get("name", "World")
    return {
        "message": f"✅ Demo executed for {payload.get('agent','unknown')}. Hello, {name}!",
        "input": payload,
    }

register(Agent(
    slug="website-creator",
    title="Website Creator Agent",
    summary="No-code site builder that emits clean HTML/CSS or React + Tailwind.",
    badges=["★"],
    kinds=["No-code","Web","Generator","Writing","Demo"],
    status="Open Demo",
    demo_fn=lambda p: echo_demo({**p, "agent": "website-creator"}),
))

register(Agent(
    slug="app-generator",
    title="App Generator Agent",
    summary="Turn specs into working web apps fast—layouts, forms, and data wiring.",
    badges=["★"],
    kinds=["No-code","Apps","Generator","Demo"],
    status="Open Demo",
    demo_fn=lambda p: echo_demo({**p, "agent": "app-generator"}),
))

register(Agent(
    slug="assistialab-omni",
    title="AssistiaLab Omni Agent",
    summary="All-in-one multi-tool super-agent.",
    badges=["★"],
    kinds=["Core AI","No-code","Demo"],
    status="Open Demo",
    demo_fn=lambda p: echo_demo({**p, "agent": "assistialab-omni"}),
))

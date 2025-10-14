from __future__ import annotations
from pydantic import BaseModel, Field
from typing import List, Literal, Optional, Callable, Dict, Any

AgentKind = Literal[
    "No-code","Web","Apps","Generator","Writing","Image","Video","NLP","JSON",
    "Marketing","SEO","Chat","Automation","Robotics","Analytics","Finance",
    "Data","DevOps","Integration","AI","Core AI","Computer Vision","Speech",
    "Realtime","Health","Sports","Social","Translation","Summarization",
    "Preview","Labs","Demo"
]

class Agent(BaseModel):
    slug: str = Field(..., regex=r"^[a-z0-9-]+$")
    title: str
    summary: str
    badges: List[str] = []
    kinds: List[AgentKind] = []
    status: Literal["Open Demo","Preview","Labs","Demo"] = "Open Demo"
    docs_url: Optional[str] = None
    demo_fn: Optional[Callable[[Dict[str, Any]], Dict[str, Any]]] = None

# demo payload/response aliases (for future typing)
DemoRequest = Dict[str, Any]
DemoResponse = Dict[str, Any]

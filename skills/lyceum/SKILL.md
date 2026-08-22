---
name: lyceum
description: Lyceum Cloud Serverless inference guidance, model selection, and API integration.
---

# Lyceum Cloud Integration Skill

Use this skill when interacting with Lyceum Cloud serverless inference APIs, choosing models, or diagnosing connection issues.

## Endpoints & Auth

- **OpenAI-compatible Endpoint**: `https://api.lyceum.technology/openai/v1`
- **Auth Header**: `Authorization: Bearer <API_KEY>` (keys start with `lk_...`)
- **Environment Variable**: `LYCEUM_API_KEY`

## Recommended Models

- **`lyceum/router`**: Recommended default for general coding and tasks. Classifies prompt complexity and routes automatically to the optimal model, resolved via Lyceum's routing protocol (`POST /api/v2/external/serverless/route`). Requires the bundled extension.
- **`moonshotai/kimi-k2.7-code`**: Specialized for agentic coding, deep tool loops, large codebases (256k context window).
- **`z-ai/glm-5.2`**: Strong general reasoning with visible step-by-step thinking traces.
- **`deepseek/deepseek-v4-flash-0731`**: Low-latency autocomplete and small edits.

## Model Selection in Pi

Switch models on the fly in Pi:
```
/model lyceum/moonshotai/kimi-k2.7-code
/model lyceum/lyceum/router
/model lyceum/z-ai/glm-5.2
```

## Smart Routing Protocol

Routing keywords (`lyceum/router`, `lyceum/simple`, `lyceum/complex`, `lyceum/reasoning`) are **not** accepted by the OpenAI-compatible `/chat/completions` surface — submitting them there returns `model not found`. The bundled extension resolves them through Lyceum's dedicated routing endpoint before sending the actual completion:

```text
POST https://api.lyceum.technology/api/v2/external/serverless/route
{
  "input": "<latest user prompt text>"
}

→ { "complexity": string, "score": number, "model": string }
```

If the routing endpoint is unavailable, the extension falls back to a fixed concrete model per tier (`simple` → DeepSeek V4 Flash, `complex`/`router` → GLM-5.2, `reasoning` → Kimi K3). Routing requires the bundled extension; a raw `models.json` entry alone cannot drive it.

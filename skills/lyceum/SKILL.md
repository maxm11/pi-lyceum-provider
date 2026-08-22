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

- **`lyceum/router`**: Recommended default for general coding and tasks. Classifies prompt complexity and routes automatically to the optimal model.
- **`moonshotai/kimi-k2.7-code`**: Specialized for agentic coding, deep tool loops, large codebases (200k context window).
- **`z-ai/glm-5.2`**: Strong general reasoning with visible step-by-step thinking traces.
- **`z-ai/glm-5.2-instant`**: Fast non-reasoning turns without thinking trace overhead.
- **`deepseek/deepseek-v4-flash-0731`**: Low-latency autocomplete and small edits.

## Model Selection in Pi

Switch models on the fly in Pi:
```
/model lyceum/moonshotai/kimi-k2.7-code
/model lyceum/lyceum/router
/model lyceum/z-ai/glm-5.2
```

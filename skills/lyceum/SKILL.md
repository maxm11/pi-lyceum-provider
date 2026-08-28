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

- **`moonshotai/kimi-k2.7-code`**: Specialized for agentic coding, deep tool loops, large codebases (256k context window). Reasoning enabled.
- **`z-ai/glm-5.3`**: Flagship general reasoning model with strong math, coding, and bilingual capabilities (1M context window). Reasoning enabled.
- **`deepseek/deepseek-v4-flash-0731`**: Low-latency autocomplete, fast edits, and high-throughput tool use (1M context window).
- **`qwen/qwen3.8-flash-next`**: High-speed reasoning model with fast generation and low latency (256k context window).

## Model Selection in Pi

Switch models on the fly in Pi:
```
/model lyceum/moonshotai/kimi-k2.7-code
/model lyceum/z-ai/glm-5.3
/model lyceum/deepseek/deepseek-v4-flash-0731
```

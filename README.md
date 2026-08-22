# pi-lyceum-provider

[![CI](https://github.com/maxm11/pi-lyceum-provider/actions/workflows/ci.yml/badge.svg)](https://github.com/maxm11/pi-lyceum-provider/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Official Lyceum Cloud Serverless API provider for the [Pi Coding Agent](https://pi.dev) (`@earendil-works/pi-coding-agent` / `@earendil-works/pi-ai`).

Seamlessly connect Pi to [Lyceum Cloud](https://lyceum.technology) serverless inference endpoints and **Smart Routing** using standard API keys (`lk_...`).

---

## Features

- **Standard Pi Package**: Complies with the official [Pi Packages Specification](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/packages.md), bundleable and installable via `pi install`.
- **OpenAI-Compatible Serverless Endpoints**: Pointed directly at `https://api.lyceum.technology/openai/v1`.
- **Smart Routing**: Use `lyceum/router`, `lyceum/simple`, `lyceum/complex`, and `lyceum/reasoning` for automatic or tiered prompt complexity routing. Routing keywords are resolved through Lyceum's dedicated routing protocol (`POST /api/v2/external/serverless/route`), which the bundled extension wires into pi automatically.
- **Top Coding & Reasoning Models**: Curated model parameters with accurate context windows (up to 200k tokens), max token limits, thinking trace flags, and cost profiles.
- **Dynamic Model Discovery**: Automatically fetches and registers the latest remote models from `GET /openai/v1/models` when an API key is present.
- **Standard API Key Auth**: Resolves `LYCEUM_API_KEY` via environment variable or Pi configuration.
- **Bundled Skills & Extension**: Includes the `lyceum` skill and conventional extension hooks.

---

## Installation & Setup

### 1. Set Your Lyceum API Key
Get an API key (prefixed `lk_...`) from the [Lyceum Cloud Dashboard](https://dashboard.lyceum.technology/api-keys) and export it:

```bash
export LYCEUM_API_KEY=lk_your_api_key_here
```

---

### 2. Install into Pi Agent

#### Option A: Install as a Pi Package (Recommended)
Install directly using the Pi CLI:

```bash
# Install from Git repository
pi install git:github.com/maxm11/pi-lyceum-provider

# Or install from npm
pi install npm:pi-lyceum-provider

# Or install to current project settings (.pi/settings.json)
pi install -l git:github.com/maxm11/pi-lyceum-provider
```

#### Option B: Try Without Installing (Ephemeral Run)
```bash
pi -e git:github.com/maxm11/pi-lyceum-provider
```

#### Option C: Automated CLI Setup for `models.json`
```bash
npx pi-lyceum-provider setup
```

#### Option D: Manual `models.json`
Add the provider block to `~/.pi/agent/models.json`. Concrete serverless models work through the OpenAI-compatible surface directly:

> **⚠️ Smart Routing keywords (`lyceum/router`, `lyceum/simple`, `lyceum/complex`, `lyceum/reasoning`) require the extension.** They are resolved through Lyceum's separate routing protocol (`POST /api/v2/external/serverless/route`) rather than `/chat/completions`. A bare `models.json` entry has no way to carry that custom request logic, so always use the bundled extension (Options A, B, or C) when you want routing. The extension registers the routing-aware stream automatically.
```json
{
  "providers": {
    "lyceum": {
      "name": "Lyceum Cloud",
      "baseUrl": "https://api.lyceum.technology/openai/v1",
      "api": "openai-completions",
      "apiKey": "$LYCEUM_API_KEY",
      "compat": {
        "supportsDeveloperRole": false,
        "supportsReasoningEffort": true,
        "maxTokensField": "max_tokens",
        "requiresToolResultName": true
      },
      "models": [
        {
          "id": "moonshotai/kimi-k2.7-code",
          "name": "Kimi K2.7 Code",
          "reasoning": true,
          "contextWindow": 200000,
          "maxTokens": 65536
        },
        {
          "id": "z-ai/glm-5.2",
          "name": "GLM 5.2 (Reasoning)",
          "reasoning": true,
          "contextWindow": 128000,
          "maxTokens": 16384
        },
        {
          "id": "deepseek/deepseek-v4-pro",
          "name": "DeepSeek V4 Pro",
          "reasoning": true,
          "contextWindow": 128000,
          "maxTokens": 16384
        },
        {
          "id": "deepseek/deepseek-v4-flash-0731",
          "name": "DeepSeek V4 Flash",
          "reasoning": false,
          "contextWindow": 128000,
          "maxTokens": 16384
        }
      ]
    }
  }
}
```

---

## Launch Pi with Lyceum

Run Pi with any Lyceum model:

```bash
# Agentic coding with Kimi K2.7 Code
pi --model lyceum/moonshotai/kimi-k2.7-code

# Smart Router (automatically routes prompts based on task complexity)
pi --model lyceum/lyceum/router

# General reasoning with GLM 5.2
pi --model lyceum/z-ai/glm-5.2
```

Or switch models interactively inside Pi by typing `/model` and searching for `lyceum`.

---

## How Smart Routing Works

Lyceum's routing keywords are **not** accepted by the OpenAI-compatible `/chat/completions` endpoint — sending `lyceum/router` there returns `model not found`. Instead they are resolved through Lyceum's dedicated routing protocol:

```text
POST https://api.lyceum.technology/api/v2/external/serverless/route
{
  "input": "<latest user prompt text>"
}

→ { "complexity": string, "score": number, "model": string }
```

The endpoint classifies the prompt and returns the concrete model that should serve it. The bundled extension then sends the actual chat completion to `/chat/completions` using that resolved model, so streaming, tool calling, and usage accounting all work normally.

Resolution details:

- `lyceum/router` asks the router to pick the optimal model for each prompt.
- `lyceum/simple`, `lyceum/complex`, and `lyceum/reasoning` map to their fixed tier's representative model.
- If the routing endpoint is unreachable or returns no model, the extension **falls back to a fixed concrete model per tier** (`simple` → DeepSeek V4 Flash, `complex`/`router` → GLM-5.2, `reasoning` → Kimi K3) so your session keeps working.
- The resolved model is cached per session and API key, so a multi-turn agentic session stays on one concrete model instead of drifting.

Requires the bundled extension (see installation Options A, B, or C).

## Available Models

| Model ID | Context Window | Reasoning Trace | Recommended For |
|---|---|---|---|
| `lyceum/router` | — | Automatic | Automatic routing based on prompt complexity |
| `lyceum/simple` | — | No | Fast, cost-efficient model for simple tasks |
| `lyceum/complex` | — | Yes | High-capability model for deep tasks (routing via `/route`) |
| `lyceum/reasoning` | — | Yes | Dedicated reasoning tier (routing via `/route`) |
| `moonshotai/kimi-k2.7-code` | 256k | Yes | Agentic coding & tool execution loops |
| `z-ai/glm-5.2` | 1M | Yes | Strong general reasoning & math |
| `moonshotai/kimi-k3` | 1M | Yes | Long-context document & codebase analysis |
| `moonshotai/kimi-k2.6` | 256k | Yes | Balanced deep reasoning |
| `deepseek/deepseek-v4-pro` | 1M | No* | Low-cost high reasoning performance |
| `deepseek/deepseek-v4-flash-0731` | 1M | No | Ultra-fast edits and autocomplete |
| `minimax/minimax-m3` | 1M | Yes | High throughput and cost efficiency |
| `qwen/qwen3.5-9b` | 256k | Yes | Lightweight interactive turns |
| `qwen/qwen3.8-2.4t-a95b` | 256k | Yes | Large MoE reasoning model |

\* `deepseek/deepseek-v4-pro` reasons off by default; enable with `chat_template_kwargs: {"thinking": true}`.

---

## CLI Reference

`pi-lyceum-provider` includes a built-in CLI helper:

```bash
# List all models and their capabilities
npx pi-lyceum-provider list

# Test your Lyceum API key connection
npx pi-lyceum-provider test --key lk_...

# Print models.json snippet to stdout
npx pi-lyceum-provider print-config

# Configure ~/.pi/agent/models.json
npx pi-lyceum-provider setup

# Dry run setup without writing to disk
npx pi-lyceum-provider setup --dry-run
```

---

## Programmatic API

You can also import and use the provider programmatically:

```typescript
import registerLyceumExtension, {
  createLyceumProviderConfig,
  fetchLyceumModels,
  getLyceumModelsJsonConfig,
  streamLyceum,
  resolveRoutedModel,
  LYCEUM_ROUTE_URL,
  ROUTING_MODEL_IDS,
  DEFAULT_LYCEUM_MODELS,
} from 'pi-lyceum-provider';
```

---

## Continuous Integration & Testing

This project includes a continuous integration pipeline (`.github/workflows/ci.yml`) that validates:
- Multi-version Node.js builds (`18.x`, `20.x`, `22.x`)
- TypeScript type safety (`npm run typecheck`)
- Test suites (`npm test`)
- CLI command integrity

To run tests locally:
```bash
npm install
npm run typecheck
npm test
npm run build
```

---

## License

[MIT](LICENSE)

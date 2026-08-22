# pi-lyceum-provider

[![CI](https://github.com/maxm11/pi-lyceum-provider/actions/workflows/ci.yml/badge.svg)](https://github.com/maxm11/pi-lyceum-provider/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Official Lyceum Cloud Serverless API provider for the [Pi Coding Agent](https://pi.dev) (`@earendil-works/pi-coding-agent` / `@earendil-works/pi-ai`).

Seamlessly connect Pi to [Lyceum Cloud](https://lyceum.technology) serverless inference endpoints and **Smart Routing** using standard API keys (`lk_...`).

---

## Features

- **OpenAI-Compatible Serverless Endpoints**: Pointed directly at `https://api.lyceum.technology/openai/v1`.
- **Smart Routing**: Use `lyceum/router`, `lyceum/simple`, `lyceum/complex`, and `lyceum/reasoning` for automatic or tiered prompt complexity routing.
- **Top Coding & Reasoning Models**: Curated model parameters with accurate context windows (up to 200k tokens), max token limits, thinking trace flags, and cost profiles.
- **Dynamic Model Discovery**: Automatically fetches and registers the latest remote models from `GET /openai/v1/models` when an API key is present.
- **Standard API Key Auth**: Resolves `LYCEUM_API_KEY` via environment variable or Pi configuration.
- **Multiple Integration Modes**:
  - **Pi Extension**: Load directly via `pi -e pi-lyceum-provider` or auto-load from `~/.pi/agent/extensions/`.
  - **`models.json` Configuration**: One-command setup or copy-paste static config.
  - **CLI Helper**: Interactive and scriptable setup, test, and listing commands.

---

## Quick Start

### 1. Get a Lyceum API Key
Generate an API key (prefixed `lk_...`) from the [Lyceum Cloud Dashboard](https://dashboard.lyceum.technology/api-keys).

Export your API key:
```bash
export LYCEUM_API_KEY=lk_your_api_key_here
```

---

### 2. Configure Pi Agent

You can configure Pi using any of the methods below:

#### Method A: Automated CLI Setup (Recommended)
Run the setup tool to automatically configure `~/.pi/agent/models.json`:
```bash
npx pi-lyceum-provider setup
```
Or for local project-level configuration:
```bash
npx pi-lyceum-provider setup --local
```

#### Method B: As a Pi Extension
Load the extension at startup:
```bash
pi -e pi-lyceum-provider
```
Or install it in your Pi agent extensions directory:
```bash
npm install -g pi-lyceum-provider
# or link into ~/.pi/agent/extensions/
```

#### Method C: Manual `models.json`
Add the provider block to `~/.pi/agent/models.json`:
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
          "id": "lyceum/router",
          "name": "Lyceum Smart Router",
          "reasoning": true,
          "contextWindow": 200000,
          "maxTokens": 16384
        },
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
          "id": "z-ai/glm-5.2-instant",
          "name": "GLM 5.2 Instant",
          "reasoning": false,
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

# Fast non-reasoning instant turns
pi --model lyceum/z-ai/glm-5.2-instant
```

Or switch models interactively inside Pi by typing `/model` and searching for `lyceum`.

---

## Available Models

| Model ID | Context Window | Reasoning Trace | Recommended For |
|---|---|---|---|
| `lyceum/router` | 200k | Automatic | Automatic routing based on prompt complexity |
| `lyceum/simple` | 128k | No | Fast, cost-efficient model for simple tasks |
| `lyceum/complex` | 200k | Yes | High-capability model for deep tasks |
| `lyceum/reasoning` | 200k | Yes | Dedicated reasoning tier |
| `moonshotai/kimi-k2.7-code` | 200k | Yes | Agentic coding & tool execution loops |
| `z-ai/glm-5.2` | 128k | Yes | Strong general reasoning & math |
| `z-ai/glm-5.2-instant` | 128k | No | Fast turns without thinking trace overhead |
| `moonshotai/kimi-k3` | 200k | Yes | Long-context document & codebase analysis |
| `moonshotai/kimi-k2.6` | 200k | Yes | Balanced deep reasoning |
| `deepseek/deepseek-v4-pro` | 128k | Yes | Low-cost high reasoning performance |
| `deepseek/deepseek-v4-flash-0731` | 128k | No | Ultra-fast edits and autocomplete |
| `minimax/minimax-m3` | 128k | Yes | High throughput and cost efficiency |
| `qwen/qwen3.5-9b` | 128k | Yes | Lightweight interactive turns |
| `qwen/qwen3.8-2.4t-a95b` | 128k | Yes | Large MoE reasoning model |

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

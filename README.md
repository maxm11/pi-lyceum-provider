# pi-lyceum-provider

[![CI](https://github.com/maxm11/pi-lyceum-provider/actions/workflows/ci.yml/badge.svg)](https://github.com/maxm11/pi-lyceum-provider/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Official Lyceum Cloud Serverless API provider for the [Pi Coding Agent](https://pi.dev) (`@earendil-works/pi-coding-agent` / `@earendil-works/pi-ai`).

Seamlessly connect Pi to [Lyceum Cloud](https://lyceum.technology) serverless inference endpoints using standard API keys (`lk_...`).

---

## Features

- **Standard Pi Package**: Complies with the official [Pi Packages Specification](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/packages.md), bundleable and installable via `pi install`.
- **OpenAI-Compatible Serverless Endpoints**: Pointed directly at `https://api.lyceum.technology/openai/v1`.
- **Top Coding & Reasoning Models**: Curated model parameters with accurate context windows (up to 1M tokens), max token limits, thinking trace flags, and cost profiles.
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
        "supportsReasoningEffort": false,
        "maxTokensField": "max_tokens",
        "requiresToolResultName": true,
        "thinkingFormat": "openai"
      },
      "models": [
        {
          "id": "moonshotai/kimi-k2.7-code",
          "name": "Kimi K2.7 Code",
          "reasoning": true,
          "contextWindow": 256000,
          "maxTokens": 65536
        },
        {
          "id": "z-ai/glm-5.3",
          "name": "GLM-5.3",
          "reasoning": true,
          "contextWindow": 1000000,
          "maxTokens": 65536
        },
        {
          "id": "deepseek/deepseek-v4-pro",
          "name": "DeepSeek V4 Pro",
          "reasoning": false,
          "contextWindow": 1000000,
          "maxTokens": 65536
        },
        {
          "id": "deepseek/deepseek-v4-flash-0731",
          "name": "DeepSeek V4 Flash",
          "reasoning": false,
          "contextWindow": 1000000,
          "maxTokens": 65536
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

# Flagship general reasoning with GLM 5.3
pi --model lyceum/z-ai/glm-5.3

# Fast, high-throughput edits with DeepSeek V4 Flash
pi --model lyceum/deepseek/deepseek-v4-flash-0731
```

Or switch models interactively inside Pi by typing `/model` and searching for `lyceum`.

---

## Available Models

| Model ID | Context Window | Reasoning Trace | Recommended For |
|---|---|---|---|
| `moonshotai/kimi-k2.7-code` | 256k | Yes | Agentic coding & tool execution loops |
| `z-ai/glm-5.3` | 1M | Yes | Flagship reasoning, coding, & mathematics |
| `z-ai/glm-5.3-flash` | 1M | Yes | Fast low-latency reasoning & high-throughput agents |
| `z-ai/glm-5.2` | 1M | Yes | Strong bilingual reasoning & tool use |
| `z-ai/glm-5.1` | 200k | Yes | Flagship reasoning with advanced tool use |
| `moonshotai/kimi-k3` | 1M | Yes | Long-context document & codebase analysis |
| `moonshotai/kimi-k2.6` | 256k | Yes | Native multimodal reasoning & tool use |
| `deepseek/deepseek-v4-pro` | 1M | No* | Advanced coding & long-horizon workflows |
| `deepseek/deepseek-v4-flash-0731` | 1M | No | Ultra-fast edits and autocomplete |
| `minimax/minimax-m3` | 1M | Yes | High throughput 1M-context reasoning |
| `minimax/minimax-m2.5` | 1M | No | Balanced document & conversation tasks |
| `qwen/qwen3.8-2.4t-a95b` | 256k | Yes | Flagship MoE reasoning model |
| `qwen/qwen3.8-flash-next` | 256k | Yes | High-speed reasoning with low latency |
| `qwen/qwen3.8-27b` | 256k | Yes | Balanced dense model with reasoning & tools |
| `qwen/qwen3.5-397b-a17b` | 256k | No | Large-scale MoE instruction following |
| `qwen/qwen3.5-9b` | 256k | Yes | Compact model for fast reasoning |
| `qwen/qwen3-235b-a22b-instruct-2507` | 256k | No | High-quality instruction following & coding |
| `qwen/qwen3-30b-a3b-instruct-2507` | 256k | No | Efficient MoE instruction following |
| `qwen/qwen3-next-80b-a3b-thinking` | 256k | Yes | Specialized thinking variant |
| `qwen/qwen3-32b` | 128k | No | Compact balanced model |
| `qwen/qwen2.5-vl-72b-instruct` | 128k | No | Multimodal vision-language model |
| `openai/gpt-oss-120b` | 128k | No | Open-weight 120B model |
| `meta-llama/llama-3.3-70b-instruct` | 128k | No | Meta flagship 70B instruction model |
| `google/gemma-3-27b-it` | 128k | No | Multimodal instruction model |
| `nousresearch/hermes-4-405b` | 128k | No | High-capacity open instruction model |
| `nousresearch/hermes-4-70b` | 128k | No | Efficient conversational model |
| `openbmb/minicpm-v-4_5` | 128k | No | Multimodal vision-language model |
| `nvidia/cosmos3-super-reasoner` | 128k | Yes | Multi-step super reasoning |
| `nvidia/nemotron-3-nano-omni` | 128k | No | Omni-modal agentic model |
| `nvidia/nvidia-nemotron-3-nano-30b-a3b` | 128k | No | Ultra-efficient MoE reasoning |
| `nvidia/nemotron-3-super-120b-a12b` | 128k | No | High-capacity enterprise reasoning |
| `nvidia/nemotron-3-ultra-550b-a55b` | 128k | No | Massive frontier reasoning model |
| `nvidia/llama-3_1-nemotron-ultra-253b-v1` | 128k | No | Tuned for reasoning & code synthesis |

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
  DEFAULT_LYCEUM_MODELS,
  LYCEUM_BASE_URL,
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


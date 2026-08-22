import type { ModelDefinition } from './types.js';

export const LYCEUM_BASE_URL = 'https://api.lyceum.technology/openai/v1';

/**
 * Curated list of Lyceum Cloud serverless models with accurate context
 * limits, pricing, and reasoning defaults.
 *
 * Sources:
 * - Model catalogue & context windows / pricing:
 *   https://lyceum.technology/products/inference/models/index.html
 * - Reasoning defaults & chat_template_kwargs toggling:
 *   https://docs.lyceum.technology/docs/inference/serverless
 *   https://docs.lyceum.technology/docs/inference/routing
 *
 * Ordering note: the `lyceum/*` entries are Smart Routing keywords, not chat
 * models. They are handled by Lyceum's routing protocol
 * (`POST /api/v2/external/serverless/route`) rather than the OpenAI-compatible
 * `/chat/completions` surface, and they are listed here for completeness.
 */
export const DEFAULT_LYCEUM_MODELS: ModelDefinition[] = [
  // ===========================================================================
  // Smart Routing keywords (separate routing protocol; not chat models)
  // ===========================================================================
  {
    id: 'lyceum/router',
    name: 'Lyceum Smart Router',
    description: 'Classifies each prompt and routes to the optimal model automatically',
    reasoning: true,
    input: ['text'],
    contextWindow: 1000000,
    maxTokens: 65536,
    cost: { input: 1.75, output: 4.5, cacheRead: 0.44, cacheWrite: 1.75 },
  },
  {
    id: 'lyceum/simple',
    name: 'Lyceum Simple Tier',
    description: 'Always routes to a fast, cost-efficient model for simple queries and edits',
    reasoning: false,
    input: ['text'],
    contextWindow: 1000000,
    maxTokens: 65536,
    cost: { input: 0.15, output: 0.3, cacheRead: 0.04, cacheWrite: 0.15 },
  },
  {
    id: 'lyceum/complex',
    name: 'Lyceum Complex Tier',
    description: 'Always routes to a high-capability model for multi-step reasoning and deep tasks',
    reasoning: true,
    input: ['text'],
    contextWindow: 1000000,
    maxTokens: 65536,
    cost: { input: 1.75, output: 4.5, cacheRead: 0.44, cacheWrite: 1.75 },
  },
  {
    id: 'lyceum/reasoning',
    name: 'Lyceum Reasoning Tier',
    description: 'Always routes to a dedicated reasoning model with visible reasoning traces',
    reasoning: true,
    input: ['text'],
    contextWindow: 1000000,
    maxTokens: 65536,
    cost: { input: 1.75, output: 4.5, cacheRead: 0.44, cacheWrite: 1.75 },
  },

  // ===========================================================================
  // Serverless Coding & Reasoning Models
  // ===========================================================================

  // Kimi K3 — Moonshot's flagship reasoning model. 1M-token context.
  {
    id: 'moonshotai/kimi-k3',
    name: 'Kimi K3',
    description: 'Moonshot flagship reasoning model with long-context understanding, tool use, and agentic capabilities',
    reasoning: true,
    input: ['text', 'image'],
    contextWindow: 1000000,
    maxTokens: 65536,
    cost: { input: 3.0, output: 15.0, cacheRead: 0.75, cacheWrite: 3.0 },
  },

  // Kimi K2.7 Code — coding-focused agentic Kimi model. 256K context.
  {
    id: 'moonshotai/kimi-k2.7-code',
    name: 'Kimi K2.7 Code',
    description: 'Coding-focused agentic Kimi model with strong tool use and long-context reasoning',
    reasoning: true,
    input: ['text', 'image'],
    contextWindow: 256000,
    maxTokens: 65536,
    cost: { input: 1.25, output: 4.5, cacheRead: 0.31, cacheWrite: 1.25 },
  },

  // Kimi K2.6 — native multimodal agentic model. 256K context.
  {
    id: 'moonshotai/kimi-k2.6',
    name: 'Kimi K2.6',
    description: 'Native multimodal agentic model with long-context capabilities',
    reasoning: true,
    input: ['text', 'image'],
    contextWindow: 256000,
    maxTokens: 65536,
    cost: { input: 1.0, output: 4.0, cacheRead: 0.25, cacheWrite: 1.0 },
  },

  // Kimi K2.5 — strong long-context and reasoning. 256K context.
  {
    id: 'moonshotai/kimi-k2.5',
    name: 'Kimi K2.5',
    description: 'Strong long-context and reasoning capabilities',
    reasoning: true,
    input: ['text', 'image'],
    contextWindow: 256000,
    maxTokens: 65536,
    cost: { input: 0.5, output: 2.5, cacheRead: 0.13, cacheWrite: 0.5 },
  },

  // DeepSeek V4 Pro — advanced reasoning, coding, long-horizon agents. 1M context.
  // NOTE: reasoning is OFF by default; enable via chat_template_kwargs {"thinking": true}.
  {
    id: 'deepseek/deepseek-v4-pro',
    name: 'DeepSeek V4 Pro',
    description: 'Advanced reasoning, coding, and long-horizon agent workflows. Reasoning off by default (enable with {"thinking": true})',
    reasoning: false,
    input: ['text'],
    contextWindow: 1000000,
    maxTokens: 65536,
    cost: { input: 1.75, output: 3.5, cacheRead: 0.44, cacheWrite: 1.75 },
  },

  // DeepSeek V4 Flash — fast, low-cost V4. 1M context. Reasoning off by default.
  {
    id: 'deepseek/deepseek-v4-flash-0731',
    name: 'DeepSeek V4 Flash',
    description: 'Fast, low-cost V4 model with a 1M-token context window for high-throughput text and tool use',
    reasoning: false,
    input: ['text'],
    contextWindow: 1000000,
    maxTokens: 65536,
    cost: { input: 0.15, output: 0.3, cacheRead: 0.04, cacheWrite: 0.15 },
  },

  // DeepSeek V3.2 — strong coding and reasoning at low cost. 128K context.
  {
    id: 'deepseek/deepseek-v3.2',
    name: 'DeepSeek V3.2',
    description: 'Strong coding and reasoning performance at low cost',
    reasoning: false,
    input: ['text'],
    contextWindow: 128000,
    maxTokens: 16384,
    cost: { input: 0.3, output: 0.45, cacheRead: 0.08, cacheWrite: 0.3 },
  },

  // GLM-5.2 — ZAI flagship. 1M context. Reasoning on by default.
  {
    id: 'z-ai/glm-5.2',
    name: 'GLM-5.2',
    description: 'ZAI flagship with strong bilingual reasoning, long-context understanding, and tool use',
    reasoning: true,
    input: ['text', 'image'],
    contextWindow: 1000000,
    maxTokens: 65536,
    cost: { input: 1.5, output: 4.5, cacheRead: 0.38, cacheWrite: 1.5 },
  },

  // GLM-5.1 — flagship reasoning model. 200K context.
  {
    id: 'z-ai/glm-5.1',
    name: 'GLM-5.1',
    description: 'Flagship reasoning model with advanced tool use and a 200K-token context window',
    reasoning: true,
    input: ['text', 'image'],
    contextWindow: 200000,
    maxTokens: 16384,
    cost: { input: 1.4, output: 4.4, cacheRead: 0.35, cacheWrite: 1.4 },
  },

  // GLM-5 — strong reasoning. 128K context.
  {
    id: 'z-ai/glm-5',
    name: 'GLM-5',
    description: 'Strong reasoning and tool use',
    reasoning: true,
    input: ['text', 'image'],
    contextWindow: 128000,
    maxTokens: 16384,
    cost: { input: 1.0, output: 3.2, cacheRead: 0.25, cacheWrite: 1.0 },
  },

  // MiniMax M3 — 1M context with reasoning and tool use. Reasoning always on.
  {
    id: 'minimax/minimax-m3',
    name: 'MiniMax M3',
    description: '1M-token context with reasoning and tool use for large-document and agentic workloads',
    reasoning: true,
    input: ['text', 'image'],
    contextWindow: 1000000,
    maxTokens: 65536,
    cost: { input: 0.4, output: 2.0, cacheRead: 0.1, cacheWrite: 0.4 },
  },

  // Qwen3.8 2.4T A95B — flagship MoE. 256K context. Reasoning always on.
  {
    id: 'qwen/qwen3.8-2.4t-a95b',
    name: 'Qwen3.8 2.4T A95B',
    description: 'Flagship MoE model with function calling and reasoning support',
    reasoning: true,
    input: ['text'],
    contextWindow: 256000,
    maxTokens: 32768,
    cost: { input: 2.5, output: 6.0, cacheRead: 0.63, cacheWrite: 2.5 },
  },

  // Qwen3.5 9B — compact model. 256K context. Reasoning always on.
  {
    id: 'qwen/qwen3.5-9b',
    name: 'Qwen3.5 9B',
    description: 'Compact model for fast, low-cost reasoning and instruction following',
    reasoning: true,
    input: ['text', 'image'],
    contextWindow: 256000,
    maxTokens: 16384,
    cost: { input: 0.15, output: 0.2, cacheRead: 0.04, cacheWrite: 0.15 },
  },

  // Qwen3 235B A22B Instruct — 256K context.
  {
    id: 'qwen/qwen3-235b-a22b-2507',
    name: 'Qwen3 235B A22B Instruct',
    description: 'High-quality reasoning and instruction following',
    reasoning: false,
    input: ['text'],
    contextWindow: 256000,
    maxTokens: 32768,
    cost: { input: 0.2, output: 0.6, cacheRead: 0.05, cacheWrite: 0.2 },
  },
];
import type { ModelDefinition } from './types.js';

export const LYCEUM_BASE_URL = 'https://api.lyceum.technology/openai/v1';

/**
 * Curated list of Lyceum Cloud serverless models with accurate context
 * limits, pricing, and reasoning defaults.
 *
 * Sources:
 * - Model catalogue & context windows / pricing:
 *   https://lyceum.technology/products/inference/models
 * - Reasoning defaults & chat_template_kwargs toggling:
 *   https://docs.lyceum.technology/docs/inference/serverless
 */
export const DEFAULT_LYCEUM_MODELS: ModelDefinition[] = [
  // ===========================================================================
  // ZAI GLM Models
  // ===========================================================================

  // GLM-5.3 — ZAI flagship reasoning model. 1M context. Reasoning on by default.
  {
    id: 'z-ai/glm-5.3',
    name: 'GLM-5.3',
    description: 'ZAI flagship reasoning model with advanced coding, math, and bilingual reasoning',
    reasoning: true,
    input: ['text', 'image'],
    contextWindow: 1000000,
    maxTokens: 65536,
    cost: { input: 1.5, output: 4.5, cacheRead: 0.38, cacheWrite: 1.5 },
  },

  // GLM-5.3 Flash — fast low-latency GLM-5.3 variant. 1M context.
  {
    id: 'z-ai/glm-5.3-flash',
    name: 'GLM-5.3 Flash',
    description: 'Fast, low-latency GLM-5.3 variant for high-throughput reasoning and agent workflows',
    reasoning: true,
    input: ['text', 'image'],
    contextWindow: 1000000,
    maxTokens: 65536,
    cost: { input: 0.15, output: 0.3, cacheRead: 0.04, cacheWrite: 0.15 },
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

  // ===========================================================================
  // Moonshot Kimi Models
  // ===========================================================================

  // Kimi K3 — Moonshot flagship reasoning model. 1M context.
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

  // ===========================================================================
  // DeepSeek Models
  // ===========================================================================

  // DeepSeek V4 Pro — advanced reasoning, coding, long-horizon agents. 1M context.
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

  // DeepSeek V4 Flash — fast, low-cost V4. 1M context.
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

  // ===========================================================================
  // MiniMax Models
  // ===========================================================================

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

  // MiniMax M2.5 — 1M context high-throughput balanced model.
  {
    id: 'minimax/minimax-m2.5',
    name: 'MiniMax M2.5',
    description: 'High-throughput, balanced model for conversational and document tasks',
    reasoning: false,
    input: ['text', 'image'],
    contextWindow: 1000000,
    maxTokens: 65536,
    cost: { input: 0.2, output: 1.0, cacheRead: 0.05, cacheWrite: 0.2 },
  },

  // ===========================================================================
  // Qwen Models
  // ===========================================================================

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

  // Qwen3.8 Flash Next — 256K context high-speed reasoning model.
  {
    id: 'qwen/qwen3.8-flash-next',
    name: 'Qwen3.8 Flash Next',
    description: 'High-speed reasoning model with fast token generation and low latency',
    reasoning: true,
    input: ['text', 'image'],
    contextWindow: 256000,
    maxTokens: 32768,
    cost: { input: 0.15, output: 0.3, cacheRead: 0.04, cacheWrite: 0.15 },
  },

  // Qwen3.8 27B — 256K context balanced dense model with reasoning.
  {
    id: 'qwen/qwen3.8-27b',
    name: 'Qwen3.8 27B',
    description: 'Balanced dense model with strong reasoning, instruction following, and tool use',
    reasoning: true,
    input: ['text', 'image'],
    contextWindow: 256000,
    maxTokens: 32768,
    cost: { input: 0.2, output: 0.6, cacheRead: 0.05, cacheWrite: 0.2 },
  },

  // Qwen3.5 397B A17B — 256K context large-scale MoE model.
  {
    id: 'qwen/qwen3.5-397b-a17b',
    name: 'Qwen3.5 397B A17B',
    description: 'Large-scale MoE model with deep instruction following and broad multilingual coverage',
    reasoning: false,
    input: ['text'],
    contextWindow: 256000,
    maxTokens: 32768,
    cost: { input: 0.4, output: 1.2, cacheRead: 0.1, cacheWrite: 0.4 },
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
    id: 'qwen/qwen3-235b-a22b-instruct-2507',
    name: 'Qwen3 235B A22B Instruct',
    description: 'High-quality instruction following and coding performance',
    reasoning: false,
    input: ['text'],
    contextWindow: 256000,
    maxTokens: 32768,
    cost: { input: 0.2, output: 0.6, cacheRead: 0.05, cacheWrite: 0.2 },
  },

  // Qwen3 30B A3B Instruct — 256K context.
  {
    id: 'qwen/qwen3-30b-a3b-instruct-2507',
    name: 'Qwen3 30B A3B Instruct',
    description: 'Efficient MoE model for fast instruction following',
    reasoning: false,
    input: ['text'],
    contextWindow: 256000,
    maxTokens: 32768,
    cost: { input: 0.1, output: 0.3, cacheRead: 0.02, cacheWrite: 0.1 },
  },

  // Qwen3 Next 80B A3B Thinking — 256K context reasoning model.
  {
    id: 'qwen/qwen3-next-80b-a3b-thinking',
    name: 'Qwen3 Next 80B A3B Thinking',
    description: 'Specialized thinking variant for multi-step reasoning',
    reasoning: true,
    input: ['text'],
    contextWindow: 256000,
    maxTokens: 32768,
    cost: { input: 0.15, output: 1.2, cacheRead: 0.04, cacheWrite: 0.15 },
  },

  // Qwen3 32B — 128K context compact model.
  {
    id: 'qwen/qwen3-32b',
    name: 'Qwen3 32B',
    description: 'Compact model balancing quality and speed',
    reasoning: false,
    input: ['text'],
    contextWindow: 128000,
    maxTokens: 16384,
    cost: { input: 0.1, output: 0.3, cacheRead: 0.02, cacheWrite: 0.1 },
  },

  // Qwen2.5 VL 72B Instruct — 128K context multimodal vision-language model.
  {
    id: 'qwen/qwen2.5-vl-72b-instruct',
    name: 'Qwen2.5 VL 72B Instruct',
    description: 'Vision-language model supporting high-resolution image and video understanding',
    reasoning: false,
    input: ['text', 'image'],
    contextWindow: 128000,
    maxTokens: 16384,
    cost: { input: 0.25, output: 0.75, cacheRead: 0.06, cacheWrite: 0.25 },
  },

  // ===========================================================================
  // OpenAI & Meta & Google Models
  // ===========================================================================

  // OpenAI gpt-oss 120B — 128K context.
  {
    id: 'openai/gpt-oss-120b',
    name: 'OpenAI gpt-oss 120B',
    description: 'OpenAI open-weight 120B model with strong general knowledge and code understanding',
    reasoning: false,
    input: ['text'],
    contextWindow: 128000,
    maxTokens: 16384,
    cost: { input: 0.15, output: 0.6, cacheRead: 0.04, cacheWrite: 0.15 },
  },

  // Llama 3.3 70B Instruct — 128K context.
  {
    id: 'meta-llama/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B Instruct',
    description: 'Meta flagship 70B instruction-following model',
    reasoning: false,
    input: ['text'],
    contextWindow: 128000,
    maxTokens: 16384,
    cost: { input: 0.13, output: 0.4, cacheRead: 0.03, cacheWrite: 0.13 },
  },

  // Google Gemma 3 27B IT — 128K context multimodal.
  {
    id: 'google/gemma-3-27b-it',
    name: 'Gemma 3 27B IT',
    description: 'Google Gemma 3 multimodal instruction-tuned model',
    reasoning: false,
    input: ['text', 'image'],
    contextWindow: 128000,
    maxTokens: 16384,
    cost: { input: 0.1, output: 0.3, cacheRead: 0.02, cacheWrite: 0.1 },
  },

  // ===========================================================================
  // NousResearch & OpenBMB Models
  // ===========================================================================

  // Hermes 4 405B — 128K context.
  {
    id: 'nousresearch/hermes-4-405b',
    name: 'Hermes 4 405B',
    description: 'Powerful instruction-following model with long-context capabilities',
    reasoning: false,
    input: ['text'],
    contextWindow: 128000,
    maxTokens: 16384,
    cost: { input: 1.0, output: 3.0, cacheRead: 0.25, cacheWrite: 1.0 },
  },

  // Hermes 4 70B — 128K context.
  {
    id: 'nousresearch/hermes-4-70b',
    name: 'Hermes 4 70B',
    description: 'Highly capable model fine-tuned for multi-turn conversations',
    reasoning: false,
    input: ['text'],
    contextWindow: 128000,
    maxTokens: 16384,
    cost: { input: 0.13, output: 0.4, cacheRead: 0.03, cacheWrite: 0.13 },
  },

  // MiniCPM-V 4.5 — 128K context multimodal vision-language model.
  {
    id: 'openbmb/minicpm-v-4_5',
    name: 'MiniCPM-V 4.5',
    description: 'Efficient vision-language model with strong multimodal capabilities',
    reasoning: false,
    input: ['text', 'image'],
    contextWindow: 128000,
    maxTokens: 16384,
    cost: { input: 0.66, output: 1.11, cacheRead: 0.16, cacheWrite: 0.66 },
  },

  // ===========================================================================
  // NVIDIA Models
  // ===========================================================================

  // Cosmos 3 Super Reasoner — 128K context super reasoning model.
  {
    id: 'nvidia/cosmos3-super-reasoner',
    name: 'Cosmos 3 Super Reasoner',
    description: 'Super reasoning model for complex multi-step tasks',
    reasoning: true,
    input: ['text', 'image'],
    contextWindow: 128000,
    maxTokens: 16384,
    cost: { input: 0.1, output: 0.3, cacheRead: 0.02, cacheWrite: 0.1 },
  },

  // Nemotron 3 Nano Omni — 128K context omni-modal model.
  {
    id: 'nvidia/nemotron-3-nano-omni',
    name: 'Nemotron 3 Nano Omni',
    description: 'Open, efficient omni-modal reasoning model for agentic AI',
    reasoning: false,
    input: ['text', 'image'],
    contextWindow: 128000,
    maxTokens: 16384,
    cost: { input: 0.06, output: 0.24, cacheRead: 0.01, cacheWrite: 0.06 },
  },

  // Nemotron 3 Nano 30B A3B — 128K context.
  {
    id: 'nvidia/nvidia-nemotron-3-nano-30b-a3b',
    name: 'Nemotron 3 Nano 30B A3B',
    description: 'Ultra-efficient MoE model for lightweight high-throughput reasoning',
    reasoning: false,
    input: ['text'],
    contextWindow: 128000,
    maxTokens: 16384,
    cost: { input: 0.06, output: 0.24, cacheRead: 0.01, cacheWrite: 0.06 },
  },

  // Nemotron 3 Super 120B A12B — 128K context.
  {
    id: 'nvidia/nemotron-3-super-120b-a12b',
    name: 'Nemotron 3 Super 120B A12B',
    description: 'High-capacity MoE model for complex reasoning and enterprise tasks',
    reasoning: false,
    input: ['text'],
    contextWindow: 128000,
    maxTokens: 16384,
    cost: { input: 0.3, output: 0.9, cacheRead: 0.08, cacheWrite: 0.3 },
  },

  // Nemotron 3 Ultra 550B A55B — 128K context.
  {
    id: 'nvidia/nemotron-3-ultra-550b-a55b',
    name: 'Nemotron 3 Ultra 550B A55B',
    description: 'Massive scale MoE model for frontier reasoning and multi-turn workflows',
    reasoning: false,
    input: ['text'],
    contextWindow: 128000,
    maxTokens: 16384,
    cost: { input: 1.2, output: 3.6, cacheRead: 0.3, cacheWrite: 1.2 },
  },

  // Llama 3.1 Nemotron Ultra 253B — 128K context.
  {
    id: 'nvidia/llama-3_1-nemotron-ultra-253b-v1',
    name: 'Llama 3.1 Nemotron Ultra 253B',
    description: 'NVIDIA-tuned Llama 3.1 model optimized for reasoning and code synthesis',
    reasoning: false,
    input: ['text'],
    contextWindow: 128000,
    maxTokens: 16384,
    cost: { input: 0.6, output: 1.8, cacheRead: 0.15, cacheWrite: 0.6 },
  },
];
import type { ModelDefinition } from './types.js';

export const LYCEUM_BASE_URL = 'https://api.lyceum.technology/openai/v1';

/**
 * Curated list of Lyceum Cloud Serverless and Smart Routing models with
 * context limits, token capacities, modalities, and reasoning parameters.
 */
export const DEFAULT_LYCEUM_MODELS: ModelDefinition[] = [
  // ===========================================================================
  // Smart Routing Models
  // ===========================================================================
  {
    id: 'lyceum/router',
    name: 'Lyceum Smart Router',
    description: 'Classifies each prompt and automatically routes to the optimal model based on complexity',
    reasoning: true,
    input: ['text'],
    contextWindow: 200000,
    maxTokens: 16384,
    cost: { input: 0.5, output: 2.0, cacheRead: 0.1, cacheWrite: 0.5 },
  },
  {
    id: 'lyceum/simple',
    name: 'Lyceum Simple Tier',
    description: 'Always routes to a fast, cost-efficient model for simple queries and edits',
    reasoning: false,
    input: ['text'],
    contextWindow: 128000,
    maxTokens: 16384,
    cost: { input: 0.2, output: 0.8, cacheRead: 0.05, cacheWrite: 0.2 },
  },
  {
    id: 'lyceum/complex',
    name: 'Lyceum Complex Tier',
    description: 'Always routes to a high-capability model for multi-step reasoning and deep tasks',
    reasoning: true,
    input: ['text'],
    contextWindow: 200000,
    maxTokens: 16384,
    cost: { input: 1.0, output: 4.0, cacheRead: 0.2, cacheWrite: 1.0 },
  },
  {
    id: 'lyceum/reasoning',
    name: 'Lyceum Reasoning Tier',
    description: 'Always routes to a dedicated reasoning model with visible reasoning traces',
    reasoning: true,
    input: ['text'],
    contextWindow: 200000,
    maxTokens: 16384,
    cost: { input: 1.5, output: 6.0, cacheRead: 0.3, cacheWrite: 1.5 },
  },

  // ===========================================================================
  // Serverless Coding & Reasoning Models
  // ===========================================================================
  {
    id: 'moonshotai/kimi-k2.7-code',
    name: 'Kimi K2.7 Code',
    description: 'Specialized for agentic coding, tool execution loops, and large codebases',
    reasoning: true,
    input: ['text', 'image'],
    contextWindow: 200000,
    maxTokens: 65536,
    cost: { input: 1.2, output: 4.8, cacheRead: 0.3, cacheWrite: 1.2 },
  },
  {
    id: 'z-ai/glm-5.2',
    name: 'GLM 5.2 (Reasoning)',
    description: 'Strong general reasoning with step-by-step thinking trace enabled by default',
    reasoning: true,
    input: ['text', 'image'],
    contextWindow: 128000,
    maxTokens: 16384,
    cost: { input: 1.0, output: 3.5, cacheRead: 0.2, cacheWrite: 1.0 },
  },
  {
    id: 'z-ai/glm-5.2-instant',
    name: 'GLM 5.2 Instant',
    description: 'Fast non-reasoning variant of GLM 5.2 responding directly without thinking overhead',
    reasoning: false,
    input: ['text', 'image'],
    contextWindow: 128000,
    maxTokens: 16384,
    cost: { input: 1.0, output: 3.5, cacheRead: 0.2, cacheWrite: 1.0 },
  },
  {
    id: 'moonshotai/kimi-k3',
    name: 'Kimi K3',
    description: 'Massive context model optimized for long-document analysis and complex tasks',
    reasoning: true,
    input: ['text', 'image'],
    contextWindow: 200000,
    maxTokens: 32768,
    cost: { input: 1.5, output: 5.0, cacheRead: 0.35, cacheWrite: 1.5 },
  },
  {
    id: 'moonshotai/kimi-k2.6',
    name: 'Kimi K2.6',
    description: 'High-capability model with balanced latency and reasoning depth',
    reasoning: true,
    input: ['text', 'image'],
    contextWindow: 200000,
    maxTokens: 16384,
    cost: { input: 1.0, output: 3.8, cacheRead: 0.25, cacheWrite: 1.0 },
  },
  {
    id: 'deepseek/deepseek-v4-pro',
    name: 'DeepSeek V4 Pro',
    description: 'Cost-effective high reasoning performance for complex problem solving',
    reasoning: true,
    input: ['text'],
    contextWindow: 128000,
    maxTokens: 16384,
    cost: { input: 0.6, output: 2.4, cacheRead: 0.15, cacheWrite: 0.6 },
  },
  {
    id: 'deepseek/deepseek-v4-flash-0731',
    name: 'DeepSeek V4 Flash',
    description: 'Ultra-fast inference designed for quick edits, autocomplete, and low-latency workflows',
    reasoning: false,
    input: ['text'],
    contextWindow: 128000,
    maxTokens: 16384,
    cost: { input: 0.25, output: 1.0, cacheRead: 0.06, cacheWrite: 0.25 },
  },
  {
    id: 'minimax/minimax-m3',
    name: 'MiniMax M3',
    description: 'High throughput, low-cost model with integrated reasoning',
    reasoning: true,
    input: ['text'],
    contextWindow: 128000,
    maxTokens: 16384,
    cost: { input: 0.3, output: 1.2, cacheRead: 0.08, cacheWrite: 0.3 },
  },
  {
    id: 'qwen/qwen3.5-9b',
    name: 'Qwen 3.5 9B',
    description: 'Lightweight reasoning model for fast, local-style interactive turns',
    reasoning: true,
    input: ['text'],
    contextWindow: 128000,
    maxTokens: 8192,
    cost: { input: 0.2, output: 0.6, cacheRead: 0.05, cacheWrite: 0.2 },
  },
  {
    id: 'qwen/qwen3.8-2.4t-a95b',
    name: 'Qwen 3.8 2.4T A95B',
    description: 'Large Mixture-of-Experts model with high knowledge density and reasoning',
    reasoning: true,
    input: ['text'],
    contextWindow: 128000,
    maxTokens: 16384,
    cost: { input: 0.8, output: 3.0, cacheRead: 0.2, cacheWrite: 0.8 },
  },
];

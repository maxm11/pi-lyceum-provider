/**
 * Type definitions for Pi Coding Agent extension and model provider configurations.
 */

export interface ModelCost {
  input: number; // $/million tokens
  output: number; // $/million tokens
  cacheRead?: number; // $/million tokens
  cacheWrite?: number; // $/million tokens
}

export type InputModality = 'text' | 'image' | 'audio' | 'video';

export interface ThinkingLevelMap {
  minimal?: string | null;
  low?: string | null;
  medium?: string | null;
  high?: string | null;
  xhigh?: string | null;
  max?: string | null;
}

export interface ProviderCompatConfig {
  supportsDeveloperRole?: boolean;
  supportsReasoningEffort?: boolean;
  maxTokensField?: 'max_tokens' | 'max_completion_tokens';
  requiresToolResultName?: boolean;
  thinkingFormat?: 'qwen' | 'openai' | 'anthropic' | 'none';
  cacheControlFormat?: 'anthropic' | 'openai';
  [key: string]: unknown;
}

export interface ModelDefinition {
  id: string;
  name?: string;
  description?: string;
  reasoning?: boolean;
  thinkingLevelMap?: ThinkingLevelMap;
  input?: InputModality[];
  contextWindow?: number;
  maxTokens?: number;
  cost?: ModelCost;
  compat?: ProviderCompatConfig;
  samplingParams?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ProviderConfig {
  name?: string;
  baseUrl: string;
  api: 'openai-completions' | 'openai-responses' | 'anthropic-messages' | 'google-generative-ai' | string;
  apiKey?: string;
  headers?: Record<string, string>;
  authHeader?: boolean;
  compat?: ProviderCompatConfig;
  models: ModelDefinition[];
  modelOverrides?: Record<string, Partial<ModelDefinition>>;
  /**
   * Custom streaming implementation for providers whose chat surface is not
   * fully OpenAI-compatible. When present, pi invokes this for every model on
   * the provider instead of the built-in API implementation.
   */
  streamSimple?: unknown;
  [key: string]: unknown;
}

export interface ModelsJsonConfig {
  providers: Record<string, ProviderConfig>;
}

export interface ExtensionAPI {
  registerProvider(name: string, config: ProviderConfig): void;
  unregisterProvider?(name: string): void;
  [key: string]: unknown;
}

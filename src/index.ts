import { DEFAULT_LYCEUM_MODELS, LYCEUM_BASE_URL } from './models.js';
import type {
  ExtensionAPI,
  ModelDefinition,
  ModelsJsonConfig,
  ProviderConfig,
} from './types.js';

export * from './models.js';
export * from './types.js';

/**
 * Fetches available models from the Lyceum Cloud serverless models endpoint
 * and merges them with known metadata (context windows, pricing, reasoning).
 */
export async function fetchLyceumModels(
  apiKey?: string,
  baseUrl: string = LYCEUM_BASE_URL
): Promise<ModelDefinition[]> {
  const key = apiKey || process.env.LYCEUM_API_KEY;
  if (!key) {
    return [...DEFAULT_LYCEUM_MODELS];
  }

  try {
    const url = baseUrl.replace(/\/+$/, '') + '/models';
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return [...DEFAULT_LYCEUM_MODELS];
    }

    const data = (await response.json()) as {
      data?: Array<{ id: string; name?: string }>;
    };

    const remoteList = Array.isArray(data.data)
      ? data.data
      : Array.isArray(data)
      ? (data as Array<{ id: string; name?: string }>)
      : [];

    if (!remoteList.length) {
      return [...DEFAULT_LYCEUM_MODELS];
    }

    const modelMap = new Map<string, ModelDefinition>();

    // Seed with curated models
    for (const model of DEFAULT_LYCEUM_MODELS) {
      modelMap.set(model.id.toLowerCase(), { ...model });
    }

    // Merge or add discovered models.
    // The /models endpoint only exposes ids (no context/pricing/reasoning), so
    // any model not already curated gets a conservative default. Curated models
    // keep their authoritative metadata from models.ts.
    const REMOTE_FALLBACK: Omit<ModelDefinition, 'id'> = {
      reasoning: false,
      input: ['text'],
      contextWindow: 128000,
      maxTokens: 16384,
      cost: { input: 1.75, output: 3.5, cacheRead: 0.44, cacheWrite: 1.75 },
    };
    for (const item of remoteList) {
      const id = item.id;
      const keyId = id.toLowerCase();
      if (!modelMap.has(keyId)) {
        modelMap.set(keyId, { id, ...REMOTE_FALLBACK, name: item.name || id });
      }
    }

    return Array.from(modelMap.values());
  } catch {
    return [...DEFAULT_LYCEUM_MODELS];
  }
}

/**
 * Creates the provider configuration for the Lyceum Cloud serverless provider.
 */
export function createLyceumProviderConfig(options?: {
  apiKey?: string;
  baseUrl?: string;
  models?: ModelDefinition[];
}): ProviderConfig {
  const baseUrl = options?.baseUrl || LYCEUM_BASE_URL;
  const apiKey = options?.apiKey || '$LYCEUM_API_KEY';
  const models = options?.models || DEFAULT_LYCEUM_MODELS;

  return {
    name: 'Lyceum Cloud',
    baseUrl,
    api: 'openai-completions',
    apiKey,
    compat: {
      supportsDeveloperRole: false,
      // Lyceum reasoning is on/off per model (see models.ts), toggled via
      // chat_template_kwargs, not a reliably graded reasoning_effort dial.
      supportsReasoningEffort: false,
      maxTokensField: 'max_tokens',
      requiresToolResultName: true,
      thinkingFormat: 'openai',
    },
    models,
  };
}

/**
 * Returns a full models.json object conforming to Pi configuration format.
 */
export function getLyceumModelsJsonConfig(options?: {
  apiKey?: string;
  baseUrl?: string;
  models?: ModelDefinition[];
}): ModelsJsonConfig {
  return {
    providers: {
      lyceum: createLyceumProviderConfig(options),
    },
  };
}

/**
 * Default export factory function for Pi Coding Agent extension loader.
 * Pi loads this extension automatically when referenced via `pi -e <path-or-pkg>`
 * or installed in `~/.pi/agent/extensions/`.
 */
export default async function (pi: ExtensionAPI): Promise<void> {
  const apiKey = process.env.LYCEUM_API_KEY;
  let models = DEFAULT_LYCEUM_MODELS;

  if (apiKey) {
    models = await fetchLyceumModels(apiKey, LYCEUM_BASE_URL);
  }

  const config = createLyceumProviderConfig({
    apiKey: '$LYCEUM_API_KEY',
    baseUrl: LYCEUM_BASE_URL,
    models,
  });

  pi.registerProvider('lyceum', config);
}

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

    // Merge or add discovered models
    for (const item of remoteList) {
      const id = item.id;
      const keyId = id.toLowerCase();
      if (!modelMap.has(keyId)) {
        modelMap.set(keyId, {
          id,
          name: item.name || id,
          reasoning: false,
          input: ['text'],
          contextWindow: 128000,
          maxTokens: 16384,
          cost: { input: 1.0, output: 3.0, cacheRead: 0.2, cacheWrite: 1.0 },
        });
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
      supportsReasoningEffort: true,
      maxTokensField: 'max_tokens',
      requiresToolResultName: true,
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

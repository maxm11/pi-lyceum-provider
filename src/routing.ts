import {
  type Api,
  type AssistantMessage,
  type AssistantMessageEventStream,
  type Context,
  type Model,
  type SimpleStreamOptions,
  createAssistantMessageEventStream,
  openAICompletionsApi,
} from '@earendil-works/pi-ai/compat';

/**
 * Smart Routing support for Lyceum Cloud serverless inference.
 *
 * Lyceum's Smart Routing keywords (`lyceum/router`, `lyceum/simple`,
 * `lyceum/complex`, `lyceum/reasoning`) are NOT part of the OpenAI-compatible
 * chat surface. They are resolved through a dedicated routing protocol:
 *
 *   POST https://api.lyceum.technology/api/v2/external/serverless/route
 *   body:  { "input": "<prompt text>" }
 *   resp:  { "complexity": string, "score": number, "model": string }
 *
 * The endpoint classifies a prompt and returns the concrete model that should
 * serve it. It performs classification only - the actual chat completion is
 * then sent to the regular `/chat/completions` surface with the resolved model
 * id. This module wires that flow into pi as a custom `streamSimple`.
 */

export const LYCEUM_ROUTE_URL = 'https://api.lyceum.technology/api/v2/external/serverless/route';

/** Routing keywords handled by the `/route` protocol rather than `/chat/completions`. */
export const ROUTING_MODEL_IDS: ReadonlySet<string> = new Set([
  'lyceum/router',
  'lyceum/simple',
  'lyceum/complex',
  'lyceum/reasoning',
]);

const isRoutingKeyword = (id: string): boolean => ROUTING_MODEL_IDS.has(id.toLowerCase());

/**
 * Conservative per-tier fallback models used only when the `/route` endpoint
 * cannot be reached (network error, auth failure, or an unexpected response).
 * These ensure a routing keyword still yields a working concrete model even if
 * routing is unavailable, at the cost of a fixed (not adaptive) selection.
 */
const TIER_FALLBACKS: Record<string, string> = {
  // Fast, low-cost tier for simple prompts.
  'lyceum/simple': 'deepseek/deepseek-v4-flash-0731',
  // High-capability tier for multi-step reasoning and deep tasks.
  'lyceum/complex': 'z-ai/glm-5.2',
  // Dedicated reasoning tier with visible reasoning traces.
  'lyceum/reasoning': 'moonshotai/kimi-k3',
  // Automatic router falls back to the balanced high-capability tier.
  'lyceum/router': 'z-ai/glm-5.2',
};

interface RouteResponse {
  complexity?: string;
  score?: number;
  model?: string;
}

/** Extracts the most recent user-authored text to feed the router classifier. */
function extractInput(context: Context): string {
  for (let i = context.messages.length - 1; i >= 0; i--) {
    const message = context.messages[i];
    if (message.role !== 'user') continue;
    if (typeof message.content === 'string') {
      if (message.content.trim()) return message.content.trim();
      continue;
    }
    const text = message.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as { text: string }).text)
      .join('\n')
      .trim();
    if (text) return text;
  }
  return '';
}

/**
 * Resolves a routing keyword to a concrete model id by calling Lyceum's
 * `/route` classifier with the latest user prompt. Falls back to a fixed
 * per-tier model if the endpoint is unavailable.
 */
export async function resolveRoutedModel(
  input: string,
  routingKeyword: string,
  apiKey?: string,
  signal?: AbortSignal,
): Promise<string> {
  const fallback = TIER_FALLBACKS[routingKeyword.toLowerCase()] ?? TIER_FALLBACKS['lyceum/router'];

  if (!input || !apiKey) {
    // No prompt text or no credentials: cannot classify, use the tier default.
    return fallback;
  }

  try {
    const response = await fetch(LYCEUM_ROUTE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input }),
      signal,
    });

    if (!response.ok) {
      return fallback;
    }

    const data = (await response.json()) as RouteResponse;
    if (data && typeof data.model === 'string' && data.model.trim()) {
      return data.model.trim();
    }
    return fallback;
  } catch {
    return fallback;
  }
}

/**
 * Memory cache so a session keeps using one resolved model per keyword + key,
 * avoiding model drift mid-conversation and redundant `/route` round-trips.
 */
const routeCache = new Map<string, string>();

function routeCacheKey(apiKey: string, routingKeyword: string): string {
  return `${apiKey}::${routingKeyword.toLowerCase()}`;
}

/**
 * Custom streaming implementation for the Lyceum provider.
 *
 * - Routing keywords are resolved through `POST /api/v2/external/serverless/route`
 *   and then run as a normal OpenAI chat completion on the resolved model.
 * - All other (concrete) models pass straight through to the standard
 *   OpenAI-compatible streaming implementation.
 */
export function streamLyceum(
  model: Model<Api>,
  context: Context,
  options?: SimpleStreamOptions,
): AssistantMessageEventStream {
  if (!isRoutingKeyword(model.id)) {
    // Standard OpenAI-compatible model: delegate unchanged.
    return openAICompletionsApi().streamSimple(model, context, options);
  }

  const stream = createAssistantMessageEventStream();

  (async () => {
    try {
      const apiKey = options?.apiKey;
      const routingKeyword = model.id;
      const input = extractInput(context);

      const cacheKey = apiKey
        ? routeCacheKey(apiKey, routingKeyword)
        : routingKeyword.toLowerCase();
      let resolvedId = routeCache.get(cacheKey);
      if (!resolvedId) {
        resolvedId = await resolveRoutedModel(input, routingKeyword, apiKey, options?.signal);
        routeCache.set(cacheKey, resolvedId);
      }

      // Resolve against the provider's own base URL and compat settings.
      const resolvedModel: Model<'openai-completions'> = {
        ...model,
        id: resolvedId,
        api: 'openai-completions',
      };

      const innerStream = openAICompletionsApi().streamSimple(
        resolvedModel as Model<Api>,
        context,
        options,
      );

      for await (const event of innerStream) stream.push(event);
      stream.end();
    } catch (error) {
      const output: AssistantMessage = {
        role: 'assistant',
        content: [],
        api: model.api,
        provider: model.provider,
        model: model.id,
        usage: {
          input: 0,
          output: 0,
          cacheRead: 0,
          cacheWrite: 0,
          totalTokens: 0,
          cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
        },
        stopReason: 'error',
        errorMessage: error instanceof Error ? error.message : String(error),
        timestamp: Date.now(),
      };
      stream.push({ type: 'error', reason: 'error', error: output });
      stream.end();
    }
  })();

  return stream;
}
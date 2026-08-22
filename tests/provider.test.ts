import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, it } from 'node:test';
import registerLyceumExtension, {
  DEFAULT_LYCEUM_MODELS,
  LYCEUM_BASE_URL,
  LYCEUM_ROUTE_URL,
  ROUTING_MODEL_IDS,
  createLyceumProviderConfig,
  fetchLyceumModels,
  getLyceumModelsJsonConfig,
  resolveRoutedModel,
  streamLyceum,
} from '../src/index.js';
import type { ExtensionAPI, ModelsJsonConfig, ProviderConfig } from '../src/types.js';

describe('Lyceum Provider Metadata', () => {
  it('should specify correct Lyceum base URL', () => {
    assert.equal(LYCEUM_BASE_URL, 'https://api.lyceum.technology/openai/v1');
  });

  it('should include curated models with valid attributes', () => {
    assert.ok(DEFAULT_LYCEUM_MODELS.length >= 10);

    for (const model of DEFAULT_LYCEUM_MODELS) {
      assert.ok(model.id, 'Model must have an ID');
      assert.ok(model.contextWindow && model.contextWindow >= 32000, 'Context window must be >= 32k');
      assert.ok(model.maxTokens && model.maxTokens > 0, 'Max tokens must be > 0');
      assert.ok(Array.isArray(model.input) && model.input.includes('text'), 'Input must include text');
    }
  });

  it('should include key smart routing and serverless models', () => {
    const ids = DEFAULT_LYCEUM_MODELS.map((m) => m.id);
    assert.ok(ids.includes('lyceum/router'));
    assert.ok(ids.includes('lyceum/simple'));
    assert.ok(ids.includes('lyceum/complex'));
    assert.ok(ids.includes('lyceum/reasoning'));
    assert.ok(ids.includes('moonshotai/kimi-k2.7-code'));
    assert.ok(ids.includes('z-ai/glm-5.2'));
    assert.ok(ids.includes('moonshotai/kimi-k3'));
    assert.ok(ids.includes('deepseek/deepseek-v4-pro'));
    assert.ok(ids.includes('deepseek/deepseek-v4-flash-0731'));
    assert.ok(ids.includes('minimax/minimax-m3'));
    // z-ai/glm-5.2-instant is not actually deployed on the serverless API,
    // so it must NOT be advertised as a resolvable model.
    assert.ok(!ids.includes('z-ai/glm-5.2-instant'));
  });

  it('should configure Kimi K2.7 code with its real 256K context window', () => {
    const kimi = DEFAULT_LYCEUM_MODELS.find((m) => m.id === 'moonshotai/kimi-k2.7-code');
    assert.ok(kimi);
    assert.equal(kimi.contextWindow, 256000);
    assert.equal(kimi.reasoning, true);
  });

  it('should reflect accurate context windows from the Lyceum catalogue', () => {
    const byId = (id: string) => DEFAULT_LYCEUM_MODELS.find((m) => m.id === id);
    // 1M-token models
    assert.equal(byId('moonshotai/kimi-k3')?.contextWindow, 1000000);
    assert.equal(byId('deepseek/deepseek-v4-pro')?.contextWindow, 1000000);
    assert.equal(byId('deepseek/deepseek-v4-flash-0731')?.contextWindow, 1000000);
    assert.equal(byId('z-ai/glm-5.2')?.contextWindow, 1000000);
    assert.equal(byId('minimax/minimax-m3')?.contextWindow, 1000000);
    // 256K-token models
    assert.equal(byId('moonshotai/kimi-k2.6')?.contextWindow, 256000);
    assert.equal(byId('moonshotai/kimi-k2.5')?.contextWindow, 256000);
    assert.equal(byId('qwen/qwen3.8-2.4t-a95b')?.contextWindow, 256000);
    assert.equal(byId('qwen/qwen3.5-9b')?.contextWindow, 256000);
    // 200K / 128K models
    assert.equal(byId('z-ai/glm-5.1')?.contextWindow, 200000);
    assert.equal(byId('z-ai/glm-5')?.contextWindow, 128000);
    assert.equal(byId('deepseek/deepseek-v3.2')?.contextWindow, 128000);
  });

  it('should reflect accurate reasoning defaults per Lyceum serverless docs', () => {
    const byId = (id: string) => DEFAULT_LYCEUM_MODELS.find((m) => m.id === id);
    // DeepSeek V4 models reason OFF by default
    assert.equal(byId('deepseek/deepseek-v4-pro')?.reasoning, false);
    assert.equal(byId('deepseek/deepseek-v4-flash-0731')?.reasoning, false);
    // Kimi / GLM-5.2 / MiniMax / Qwen reasoning models are ON
    assert.equal(byId('moonshotai/kimi-k3')?.reasoning, true);
    assert.equal(byId('z-ai/glm-5.2')?.reasoning, true);
    assert.equal(byId('minimax/minimax-m3')?.reasoning, true);
  });
});

describe('Provider Configuration Generators', () => {
  it('should create valid ProviderConfig with default settings', () => {
    const config = createLyceumProviderConfig();

    assert.equal(config.name, 'Lyceum Cloud');
    assert.equal(config.baseUrl, 'https://api.lyceum.technology/openai/v1');
    assert.equal(config.api, 'openai-completions');
    assert.equal(config.apiKey, '$LYCEUM_API_KEY');
    assert.deepEqual(config.compat, {
      supportsDeveloperRole: false,
      supportsReasoningEffort: false,
      maxTokensField: 'max_tokens',
      requiresToolResultName: true,
      thinkingFormat: 'openai',
    });
    assert.equal(config.models.length, DEFAULT_LYCEUM_MODELS.length);
    // The provider must expose the custom routing-aware stream function.
    assert.equal((config as unknown as { streamSimple?: unknown }).streamSimple, streamLyceum);
  });

  it('should allow custom apiKey and models override in ProviderConfig', () => {
    const customKey = 'lk_test_key_123';
    const config = createLyceumProviderConfig({
      apiKey: customKey,
      models: [DEFAULT_LYCEUM_MODELS[0]],
    });

    assert.equal(config.apiKey, customKey);
    assert.equal(config.models.length, 1);
    assert.equal(config.models[0].id, DEFAULT_LYCEUM_MODELS[0].id);
  });

  it('should generate valid models.json structure', () => {
    const jsonConfig = getLyceumModelsJsonConfig();

    assert.ok(jsonConfig.providers);
    assert.ok(jsonConfig.providers.lyceum);
    assert.equal(jsonConfig.providers.lyceum.api, 'openai-completions');
  });

  it('should match the template models.json on disk', () => {
    const templatePath = path.resolve(process.cwd(), 'templates/models.json');
    assert.ok(fs.existsSync(templatePath), 'Template models.json must exist');

    const templateContent = fs.readFileSync(templatePath, 'utf8');
    const parsed = JSON.parse(templateContent) as ModelsJsonConfig;

    assert.ok(parsed.providers.lyceum);
    assert.equal(parsed.providers.lyceum.baseUrl, 'https://api.lyceum.technology/openai/v1');
    assert.equal(parsed.providers.lyceum.apiKey, '$LYCEUM_API_KEY');
  });
});

describe('fetchLyceumModels', () => {
  it('should return default models if no API key is provided', async () => {
    delete process.env.LYCEUM_API_KEY;
    const models = await fetchLyceumModels();
    assert.equal(models.length, DEFAULT_LYCEUM_MODELS.length);
  });

  it('should gracefully handle network failure and return fallback models', async () => {
    const models = await fetchLyceumModels('lk_dummy_key', 'https://invalid-url-domain-12345.example.com');
    assert.equal(models.length, DEFAULT_LYCEUM_MODELS.length);
  });
});

describe('Extension Factory Integration', () => {
  it('should register lyceum provider with ExtensionAPI', async () => {
    let registeredName = '';
    let registeredConfig: ProviderConfig | null = null;

    const mockPi: ExtensionAPI = {
      registerProvider: (name: string, config: ProviderConfig) => {
        registeredName = name;
        registeredConfig = config;
      },
    };

    await registerLyceumExtension(mockPi);

    assert.equal(registeredName, 'lyceum');
    assert.ok(registeredConfig !== null);
    const cfg = registeredConfig as unknown as ProviderConfig;
    assert.equal(cfg.baseUrl, 'https://api.lyceum.technology/openai/v1');
    assert.equal(cfg.api, 'openai-completions');
    assert.ok(cfg.models.length > 0);
    // Extension wiring must attach the smart-routing stream implementation.
    assert.equal((cfg as unknown as { streamSimple?: unknown }).streamSimple, streamLyceum);
  });
});

describe('Smart Routing (lyceum/*)', () => {
  it('should expose routing keywords and the route endpoint', () => {
    for (const id of ['lyceum/router', 'lyceum/simple', 'lyceum/complex', 'lyceum/reasoning']) {
      assert.ok(ROUTING_MODEL_IDS.has(id), `${id} must be a routing keyword`);
    }
    assert.equal(
      LYCEUM_ROUTE_URL,
      'https://api.lyceum.technology/api/v2/external/serverless/route',
    );
  });

  it('should fall back to tier default when no input or key is provided', async () => {
    assert.equal(await resolveRoutedModel('', 'lyceum/simple', 'lk_abc'), 'deepseek/deepseek-v4-flash-0731');
    assert.equal(await resolveRoutedModel('hello', 'lyceum/complex'), 'z-ai/glm-5.2');
    assert.equal(await resolveRoutedModel('hello', 'lyceum/reasoning', undefined), 'moonshotai/kimi-k3');
    assert.equal(await resolveRoutedModel('hello', 'lyceum/router'), 'z-ai/glm-5.2');
  });

  it('should fall back to tier default when the route endpoint is unreachable', async () => {
    const originalFetch = globalThis.fetch;
    // Simulate a network failure.
    globalThis.fetch = (async () => {
      throw new Error('network down');
    }) as typeof fetch;
    try {
      assert.equal(
        await resolveRoutedModel('some prompt', 'lyceum/simple', 'lk_abc'),
        'deepseek/deepseek-v4-flash-0731',
      );
      assert.equal(
        await resolveRoutedModel('some prompt', 'lyceum/router', 'lk_abc'),
        'z-ai/glm-5.2',
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('should return the model chosen by the route endpoint', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (input: unknown) => {
      assert.equal(String(input), LYCEUM_ROUTE_URL);
      return new Response(JSON.stringify({ complexity: 'medium', score: 0.42, model: 'moonshotai/kimi-k2.6' }));
    }) as typeof fetch;
    try {
      const id = await resolveRoutedModel('explain the class', 'lyceum/router', 'lk_abc');
      assert.equal(id, 'moonshotai/kimi-k2.6');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('should fall back when the route response omits a model', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => {
      return new Response(JSON.stringify({ complexity: 'simple', score: 0.1 }));
    }) as typeof fetch;
    try {
      assert.equal(
        await resolveRoutedModel('hello world', 'lyceum/simple', 'lk_abc'),
        'deepseek/deepseek-v4-flash-0731',
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

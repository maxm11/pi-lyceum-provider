import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, it } from 'node:test';
import registerLyceumExtension, {
  DEFAULT_LYCEUM_MODELS,
  LYCEUM_BASE_URL,
  createLyceumProviderConfig,
  fetchLyceumModels,
  getLyceumModelsJsonConfig,
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
    assert.ok(ids.includes('z-ai/glm-5.2-instant'));
    assert.ok(ids.includes('deepseek/deepseek-v4-pro'));
    assert.ok(ids.includes('deepseek/deepseek-v4-flash-0731'));
    assert.ok(ids.includes('minimax/minimax-m3'));
  });

  it('should configure Kimi K2.7 code with 200k context window', () => {
    const kimi = DEFAULT_LYCEUM_MODELS.find((m) => m.id === 'moonshotai/kimi-k2.7-code');
    assert.ok(kimi);
    assert.equal(kimi.contextWindow, 200000);
    assert.equal(kimi.reasoning, true);
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
      supportsReasoningEffort: true,
      maxTokensField: 'max_tokens',
      requiresToolResultName: true,
    });
    assert.equal(config.models.length, DEFAULT_LYCEUM_MODELS.length);
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
  });
});

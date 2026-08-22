// End-to-end smoke test for the Lyceum routing stream, run manually.
// Loads the real API key from ~/.pi/agent/auth.json and exercises streamLyceum
// against the live Lyceum API for both a routing keyword and a concrete model.
//
// Usage:   npm run build && node scripts/manual-e2e.mjs
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { streamLyceum } from '../.test-dist/src/routing.js';

const auth = JSON.parse(readFileSync(join(homedir(), '.pi', 'agent', 'auth.json'), 'utf8'));
const apiKey = auth.lyceum?.key;
if (!apiKey) {
  console.error('No lyceum key found in auth.json');
  process.exit(1);
}

function makeModel(id) {
  return {
    id,
    name: id,
    api: 'openai-completions',
    provider: 'lyceum',
    baseUrl: 'https://api.lyceum.technology/openai/v1',
    reasoning: id === 'z-ai/glm-5.2' || id === 'moonshotai/kimi-k3',
    input: ['text'],
    cost: { input: 1.75, output: 3.5, cacheRead: 0.44, cacheWrite: 1.75 },
    contextWindow: 1000000,
    maxTokens: 65536,
  };
}

function makeContext(text) {
  return {
    messages: [{ role: 'user', content: text, timestamp: Date.now() }],
  };
}

async function run(id, text) {
  return new Promise((resolve) => {
    const model = makeModel(id);
    const context = makeContext(text);
    const stream = streamLyceum(model, context, { apiKey, maxTokens: 256 });
    let done = false;

    const events = [];
    (async () => {
      let textOut = '';
      try {
        for await (const event of stream) {
          events.push(event.type);
          if (event.type === 'text_delta') textOut += event.delta;
          if (event.type === 'error') {
            console.log(`  [error] ${event.error?.errorMessage ?? 'unknown'}`);
          }
        }
      } catch (e) {
        console.log(`  [threw] ${e.message}`);
      }
      console.log(`  events: ${JSON.stringify(events)}`);
      console.log(`  text: "${textOut.trim().slice(0, 120)}"`);
      if (!done) { done = true; resolve(textOut); }
    })();
  });
}

console.log('=== Routing keyword: lyceum/router (expect /route POST -> fallback or resolved) ===');
await run('lyceum/router', 'Write a short todo list about groceries.');

console.log('=== Concrete model: deepseek/deepseek-v4-flash-0731 ===');
await run('deepseek/deepseek-v4-flash-0731', 'Reply with "pong".');

console.log('\nDone.');
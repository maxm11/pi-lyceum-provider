// End-to-end smoke test for the Lyceum provider, run manually.
// Loads the real API key from ~/.pi/agent/auth.json and exercises
// chat completions against the live Lyceum API.
//
// Usage:   node scripts/manual-e2e.mjs
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const auth = JSON.parse(readFileSync(join(homedir(), '.pi', 'agent', 'auth.json'), 'utf8'));
const apiKey = auth.lyceum?.key || process.env.LYCEUM_API_KEY;
if (!apiKey) {
  console.error('No lyceum key found in auth.json or LYCEUM_API_KEY');
  process.exit(1);
}

async function testModel(modelId, prompt) {
  console.log(`\nTesting ${modelId}...`);
  const start = Date.now();
  const res = await fetch('https://api.lyceum.technology/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 128,
    }),
  });

  const elapsed = Date.now() - start;
  if (!res.ok) {
    console.error(`Failed (${res.status}):`, await res.text());
    return;
  }

  const data = await res.json();
  const msg = data.choices?.[0]?.message;
  console.log(`  Status: OK (${elapsed}ms)`);
  console.log(`  Reply: "${(msg?.content || '').trim().slice(0, 100)}"`);
}

await testModel('deepseek/deepseek-v4-flash-0731', 'Reply with "pong".');
await testModel('moonshotai/kimi-k2.7-code', 'Reply with "pong".');

console.log('\nDone.');
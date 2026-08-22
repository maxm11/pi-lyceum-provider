#!/usr/bin/env node
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  DEFAULT_LYCEUM_MODELS,
  LYCEUM_BASE_URL,
  createLyceumProviderConfig,
  fetchLyceumModels,
} from './index.js';

interface CliArgs {
  command: string;
  key?: string;
  global: boolean;
  dryRun: boolean;
  help: boolean;
}

function parseArgs(args: string[]): CliArgs {
  const parsed: CliArgs = {
    command: 'help',
    global: true,
    dryRun: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      parsed.help = true;
    } else if (arg === '--key' || arg === '-k') {
      parsed.key = args[++i];
    } else if (arg === '--local') {
      parsed.global = false;
    } else if (arg === '--global') {
      parsed.global = true;
    } else if (arg === '--dry-run') {
      parsed.dryRun = true;
    } else if (!arg.startsWith('-') && parsed.command === 'help') {
      parsed.command = arg;
    }
  }

  if (parsed.help) {
    parsed.command = 'help';
  }

  return parsed;
}

function printHelp(): void {
  console.log(`
Lyceum Cloud Provider for Pi Coding Agent (pi-lyceum-provider)

Usage:
  pi-lyceum-provider <command> [options]

Commands:
  setup         Configure Lyceum provider in ~/.pi/agent/models.json
  list          List all available Lyceum models with context & reasoning specs
  test          Test API key connection to Lyceum Cloud
  print-config  Print models.json configuration snippet to stdout
  help          Show this help message

Options:
  --key, -k <key>   Lyceum API key (starts with lk_...). Defaults to $LYCEUM_API_KEY
  --local           Target ./models.json instead of ~/.pi/agent/models.json
  --global          Target ~/.pi/agent/models.json (default)
  --dry-run         Show what changes would be written without writing to disk
  --help, -h        Show help message

Environment Variables:
  LYCEUM_API_KEY    API key for Lyceum Cloud authentication
`);
}

async function runSetup(args: CliArgs): Promise<void> {
  const targetDir = args.global
    ? path.join(os.homedir(), '.pi', 'agent')
    : process.cwd();

  const targetFile = path.join(targetDir, 'models.json');

  console.log(`Configuring Lyceum provider for Pi agent...`);
  console.log(`Target config file: ${targetFile}`);

  const apiKey = args.key || process.env.LYCEUM_API_KEY;
  let models = DEFAULT_LYCEUM_MODELS;

  if (apiKey) {
    console.log(`Fetching latest models using provided API key...`);
    models = await fetchLyceumModels(apiKey, LYCEUM_BASE_URL);
    console.log(`Discovered ${models.length} models.`);
  } else {
    console.log(`No API key provided; using ${models.length} standard curated models.`);
    console.log(`(You can set LYCEUM_API_KEY environment variable later).`);
  }

  const lyceumConfig = createLyceumProviderConfig({
    apiKey: '$LYCEUM_API_KEY',
    baseUrl: LYCEUM_BASE_URL,
    models,
  });

  let currentConfig: { providers?: Record<string, unknown> } = { providers: {} };

  if (fs.existsSync(targetFile)) {
    try {
      const content = fs.readFileSync(targetFile, 'utf8');
      currentConfig = JSON.parse(content);
      if (!currentConfig.providers) {
        currentConfig.providers = {};
      }
    } catch (err) {
      console.warn(`Warning: Could not parse existing ${targetFile}, creating new structure.`);
      currentConfig = { providers: {} };
    }
  }

  currentConfig.providers = {
    ...currentConfig.providers,
    lyceum: lyceumConfig,
  };

  const outputJson = JSON.stringify(currentConfig, null, 2) + '\n';

  if (args.dryRun) {
    console.log('\n[Dry Run] Configuration to be written:');
    console.log(outputJson);
    return;
  }

  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(targetFile, outputJson, 'utf8');

  console.log(`\nSuccessfully configured Lyceum provider in: ${targetFile}`);
  console.log(`\nTo start using Lyceum with Pi:`);
  console.log(`  1. export LYCEUM_API_KEY=lk_your_api_key`);
  console.log(`  2. pi --model lyceum/moonshotai/kimi-k2.7-code`);
  console.log(`  or use Smart Router: pi --model lyceum/lyceum/router\n`);
}

function runList(): void {
  console.log(`\nAvailable Lyceum Serverless Models:\n`);
  console.log(
    `${'Model ID'.padEnd(35)} ${'Context'.padEnd(10)} ${'Thinking'.padEnd(10)} ${'Description'}`
  );
  console.log('-'.repeat(95));

  for (const m of DEFAULT_LYCEUM_MODELS) {
    const ctx = m.contextWindow ? `${m.contextWindow / 1000}k` : '128k';
    const think = m.reasoning ? 'Yes' : 'No';
    console.log(
      `${m.id.padEnd(35)} ${ctx.padEnd(10)} ${think.padEnd(10)} ${m.description || ''}`
    );
  }
  console.log(`\nSelect a model in Pi via: pi --model lyceum/<model-id>\n`);
}

async function runTest(args: CliArgs): Promise<void> {
  const apiKey = args.key || process.env.LYCEUM_API_KEY;
  if (!apiKey) {
    console.error('Error: No API key provided. Set LYCEUM_API_KEY or pass --key lk_...');
    process.exit(1);
  }

  console.log(`Testing Lyceum Cloud connection (${LYCEUM_BASE_URL})...`);
  const started = Date.now();

  try {
    const res = await fetch(`${LYCEUM_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'z-ai/glm-5.2-instant',
        messages: [{ role: 'user', content: 'Say "Lyceum connection successful!" in 4 words.' }],
        max_tokens: 32,
      }),
    });

    const elapsed = Date.now() - started;
    if (!res.ok) {
      const errData = await res.text();
      console.error(`\nFailed with HTTP ${res.status}:`);
      console.error(errData);
      process.exit(1);
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { total_tokens?: number };
    };

    const reply = data.choices?.[0]?.message?.content?.trim() || '(No content)';
    console.log(`\nConnection Successful! (${elapsed}ms)`);
    console.log(`Model Response: ${reply}`);
    if (data.usage?.total_tokens) {
      console.log(`Tokens used: ${data.usage.total_tokens}`);
    }
  } catch (err: unknown) {
    console.error('\nNetwork error connecting to Lyceum Cloud:');
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

function runPrintConfig(): void {
  const config = {
    providers: {
      lyceum: createLyceumProviderConfig(),
    },
  };
  console.log(JSON.stringify(config, null, 2));
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  switch (args.command) {
    case 'setup':
      await runSetup(args);
      break;
    case 'list':
      runList();
      break;
    case 'test':
      await runTest(args);
      break;
    case 'print-config':
      runPrintConfig();
      break;
    case 'help':
    default:
      printHelp();
      break;
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

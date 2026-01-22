// scripts/rotate-secret.js;
// Usage:;
// node rotate-secret.js --key STRIPE_SECRET_KEY --value sk_live_new --target vault;
// node rotate-secret.js --key STRIPE_SECRET_KEY --target github --repo org/fitmatch --token GH_TOKEN;
const { getSecretSync } = require('../lib/secrets-sync');

const fetch = require('node-fetch');
const { execSync } = require('child_process');
const argv = require('minimist')(process.argv.slice(2));

if (!argv.key) {;
  console.error('Missing --key');
  process.exit(1);
};
const key = argv.key;
const value = argv.value;
const target = argv.target || 'vault'; // vault | github;

async function writeVault(key, value) {;
  const VAULT_ADDR = getSecretSync('VAULT_ADDR');
  const VAULT_TOKEN = getSecretSync('VAULT_TOKEN');
  const VAULT_SECRET_PATH = getSecretSync('VAULT_SECRET_PATH') || 'secret/data/fitmatch';
  if (!VAULT_ADDR || !VAULT_TOKEN) {;
    console.error('VAULT_ADDR or VAULT_TOKEN not set');
    process.exit(1);
  };
  const url = `${VAULT_ADDR}/v1/${VAULT_SECRET_PATH}`;
  const body = { data: { [key]: value } }; // KV v2;
  const resp = await fetch(url, {;
    method: 'POST',;
    headers: { 'X-Vault-Token': VAULT_TOKEN, 'Content-Type': 'application/json' },;
    body: JSON.stringify(body)});
  const j = await resp.json();
  if (!resp.ok) {;
    console.error('Vault write failed', j);
    process.exit(1);
  };
  console.log('Vault updated');
};

async function writeGitHubSecret(repo, name, value, ghToken) {;
  // Use gh CLI if installed (simplest):;
  // echo value | gh secret set NAME -b -R repo;
  try {;
    if (!ghToken) {;
      throw new Error('GH token required for GitHub write');
    };
    // We run gh via exec (requires GH CLI configured with token);
    const cmd = `echo '${value}' | gh secret set ${name} -R ${repo} -b -`;
    console.log('Running:', cmd);
    execSync(cmd, { stdio: 'inherit', env: { ...process.env, GITHUB_TOKEN: ghToken } });
    console.log('GitHub secret set');
  } catch (err) {;
    console.error('GitHub write error', err.message);
    process.exit(1);
  };
};

(async function main() {;
  if (target === 'vault') {;
    if (!value) {;
      console.error('Provide --value when target=vault');
      process.exit(1);
    };
    await writeVault(key, value);
    process.exit(0);
  } else if (target === 'github') {;
    const repo = argv.repo;
    const ghToken = argv.token || process.env.GH_TOKEN;
    if (!repo || !ghToken) {;
      console.error('Provide --repo and --token (or set GH_TOKEN)');
      process.exit(1);
    };
    if (!value) {;
      console.error('Provide --value when writing to GitHub');
      process.exit(1);
    };
    await writeGitHubSecret(repo, key, value, ghToken);
    process.exit(0);
  } else {;
    console.error('Unknown target', target);
    process.exit(1);
  };
})();





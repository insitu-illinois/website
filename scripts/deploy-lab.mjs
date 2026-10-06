import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const labAccount='8ff08acf55c2976a352f2dcc15b7612f';
const labEmail='insituillinois@gmail.com';
const configPath=resolve(root,process.argv[2] ?? 'wrangler.jsonc');
const config=JSON.parse(readFileSync(configPath,'utf8'));
if(config.account_id!==labAccount) throw new Error('Deployment stopped: this configuration is not pinned to the verified lab account.');
// Wrangler checks this legacy directory before XDG_CONFIG_HOME. Never reuse it.
if(existsSync(resolve(homedir(),'.wrangler'))) throw new Error('Deployment stopped: a legacy Wrangler profile would override the isolated lab login. Use a reviewed named profile before proceeding.');
const env={...process.env};
for(const name of Object.keys(env)) if(/^(CF_|CLOUDFLARE_|WRANGLER_)/.test(name)) delete env[name];
env.XDG_CONFIG_HOME=resolve(root,'.cloudflare-lab');
env.WRANGLER_SEND_METRICS='false';
mkdirSync(env.XDG_CONFIG_HOME,{recursive:true,mode:0o700});
const cli=resolve(root,'node_modules/wrangler/bin/wrangler.js');
const identity=spawnSync(process.execPath,[cli,'whoami'],{cwd:root,env,encoding:'utf8'});
if(identity.status!==0 || !identity.stdout?.includes(labEmail) || !identity.stdout.includes(labAccount)) {
  console.error('Deployment stopped: wrangler whoami did not confirm the lab email and account ID.');
  process.exit(1);
}
console.log(`Verified lab identity: ${labEmail} (${labAccount}).`);
const result=spawnSync(process.execPath,[cli,'deploy','--config',configPath],{cwd:root,env,stdio:'inherit'});
process.exit(result.status ?? 1);

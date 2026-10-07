import tokens from '../../design-system/tokens/colors.css?raw';
const color=(name:string)=>tokens.match(new RegExp(`--${name}:(#[0-9A-Fa-f]+)`))![1];
export function GET(){return new Response(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="2" fill="${color('ink-950')}"/><text x="32" y="45" text-anchor="middle" font-family="monospace" font-size="44" fill="${color('ochre-500')}">/</text></svg>`,{headers:{'Content-Type':'image/svg+xml'}});}

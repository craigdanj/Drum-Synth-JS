import { readFile, writeFile } from 'node:fs/promises';
const read = path => readFile(new URL(path, import.meta.url), 'utf8');
const engine = await read('../src/drum-synth.js');
const kits = (await read('../src/kits.js')).replace(/^import .*;$/gm, '');
const demo = (await read('../demo/demo.js')).replace(/^import .*;$/gm, '');
const css = await read('../demo/style.css');
const html = (await read('../demo/index.html'))
  .replace('<link rel="stylesheet" href="./style.css">', () => `<style>${css}</style>`)
  .replace('<script type="module" src="./demo.js"></script>', () => `<script type="module">${engine}\n${kits}\n${demo}</script>`);
await writeFile(new URL('../demo/standalone.html', import.meta.url), html);

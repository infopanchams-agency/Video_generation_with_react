// Render review stills from one bundle.
// Usage (from videos/winroom-launch):
//   node scripts/stills.mjs WinroomLaunch16x9 0 300 790
//   node scripts/stills.mjs WinroomLaunch1x1 0 200
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {existsSync, mkdirSync} from 'node:fs';
import path from 'node:path';

const [compId, ...frames] = process.argv.slice(2);
const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root, 'out/stills');
mkdirSync(outDir, {recursive: true});

// Same browser choice as remotion.config.ts (the Node APIs do not read it).
const localChromium = '/opt/pw-browsers/chromium';
const browser = existsSync(localChromium) ? {browserExecutable: localChromium, chromeMode: 'chrome-for-testing'} : {};

const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts'), publicDir: path.join(root, 'public')});
const composition = await selectComposition({serveUrl, id: compId, ...browser});
for (const f of frames) {
	const output = path.join(outDir, `${compId}-${String(f).padStart(4, '0')}.png`);
	await renderStill({serveUrl, composition, frame: Number(f), output, ...browser});
	console.log(output);
}

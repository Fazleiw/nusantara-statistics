// Takes the screenshots listed in shots.json: opens each entry's path at its viewport in headless Chrome (see
// chrome.mjs), waits for window.__shotReady, and writes a JPEG (quality 88) into screenshots/. Console errors, failed
// requests and sideways overflow are printed so a broken page never passes silently.
//
//   node tools/shot.mjs                          every entry in shots.json
//   node tools/shot.mjs --out /tmp/x             write somewhere else (for checking pages that are not handed in)
//   node tools/shot.mjs --only 2                 just the entries whose file name contains "2"
//   node tools/shot.mjs --extra '#/prices' 390   one other path at a width (height 844 under 600, else 800)
//   node tools/shot.mjs --full ...               capture the whole page height (for checking only; too tall to hand in)

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { withSite } from './chrome.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const flag = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const outDir = flag('--out') ?? join(root, 'screenshots');
const fullPage = args.includes('--full');

let shots = JSON.parse(readFileSync(join(root, 'shots.json'), 'utf8'));
if (flag('--only')) shots = shots.filter((s) => s.file.includes(flag('--only')));
if (flag('--extra')) {
  const width = Number(args[args.indexOf('--extra') + 2] ?? 1280);
  const name = flag('--extra').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home';
  shots = [{ file: `extra-${name}-${width}.jpg`, path: flag('--extra'), viewport: { width, height: width < 600 ? 844 : 800 } }];
}
mkdirSync(outDir, { recursive: true });

await withSite(async (page) => {
  for (const shot of shots) {
    const { width, height } = shot.viewport;
    await page.open(shot.path, { width, height });
    const overflow = await page.evaluate('document.documentElement.scrollWidth - window.innerWidth');
    if (overflow > 0) page.problems.push(`page is ${overflow}px wider than the viewport`);
    const pageHeight = fullPage ? await page.evaluate('document.documentElement.scrollHeight') : height;
    const { data } = await page.send('Page.captureScreenshot', { format: 'jpeg', quality: 88, captureBeyondViewport: fullPage, clip: { x: 0, y: 0, width, height: pageHeight, scale: 1 } });
    const bytes = Buffer.from(data, 'base64');
    writeFileSync(join(outDir, shot.file), bytes);
    console.log(`${shot.file}  ${width}x${pageHeight}  ${(bytes.length / 1024).toFixed(1)} KiB${bytes.length > 262144 ? '  OVER 256 KiB' : ''}`);
    for (const problem of page.problems) console.log(`  ! ${problem}`);
  }
});

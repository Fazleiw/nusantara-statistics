// Entry point: validates this repository's app/ and screenshots/ against the bounty's caps, copies both into the
// output directory and writes dossier.json beside them.
//
//   MAKEFUN_OUTPUT_DIR=/tmp/out node main.ts
//
// Node 22+, standard library only (plus the vendored buildDossier). Every refusal is one line on stderr and exit 1.

import { cpSync, lstatSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The caps the scorer hands buildDossier. They live in one place so the checks below and the dossier agree.
const TEXT_MAX_BYTES = 163840;
const SCREENSHOTS_MIN = 3;
const SCREENSHOTS_MAX = 4;
const SCREENSHOT_MAX_BYTES = 262144;
const APP_MAX_ENTRIES = 993;
const APP_MAX_BYTES = 16777216;
const INDEX_HTML_MAX_BYTES = 1048576;
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);

// The repository root is wherever this file sits, not the caller's cwd, so `node path/to/main.ts` works from anywhere.
const ROOT = dirname(fileURLToPath(import.meta.url));
const APP_DIR = join(ROOT, 'app');
const SHOTS_DIR = join(ROOT, 'screenshots');
const OUT_DIR = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');

/** A refusal we expect and explain; main() prints its message alone, without a stack. */
class EntryError extends Error {}

const fail = (message: string): never => {
  throw new EntryError(message);
};

/** lstat that answers null for a missing path instead of throwing. */
function statOrNull(path: string) {
  try {
    return lstatSync(path);
  } catch {
    return null;
  }
}

/**
 * screenshots/ holds the captures the judges see, the first by name the cover. The scorer wants 3 or 4, and caps
 * each one's size so the dossier stays small; buildDossier also counts every non-dot regular file here as a
 * screenshot, so a stray README or a .webp would fail later with a less obvious message. Checking up front names
 * the file and its size.
 */
function checkScreenshots(): string[] {
  const st = statOrNull(SHOTS_DIR);
  if (st === null) fail('screenshots/: missing; an entry needs 3 or 4 screenshots of the running app');
  if (!st!.isDirectory()) fail('screenshots/: not a directory');

  const names: string[] = [];
  for (const entry of readdirSync(SHOTS_DIR, { withFileTypes: true })) {
    // Dotfiles (.DS_Store and friends) are skipped by buildDossier too, so they don't count either way.
    if (entry.name.startsWith('.')) continue;
    if (!entry.isFile()) fail(`screenshots/${entry.name}: not a regular file (symlinks and directories are not screenshots)`);
    if (!IMAGE_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
      fail(`screenshots/${entry.name}: not a .jpg, .jpeg or .png image`);
    }
    const size = lstatSync(join(SHOTS_DIR, entry.name)).size;
    if (size > SCREENSHOT_MAX_BYTES) {
      fail(`screenshots/${entry.name}: ${size} bytes, over the ${SCREENSHOT_MAX_BYTES}-byte screenshot limit`);
    }
    names.push(entry.name);
  }
  if (names.length < SCREENSHOTS_MIN || names.length > SCREENSHOTS_MAX) {
    fail(`screenshots/: holds ${names.length} images, but the limit is ${SCREENSHOTS_MIN} to ${SCREENSHOTS_MAX}`);
  }
  return names.sort();
}

/**
 * app/ is what gets served. The platform counts files and directories together against one entry cap and sums
 * file sizes against a byte cap; we walk the whole tree first so the message carries the real totals rather than
 * stopping at the first entry past the line. Symlinks are refused because they could point outside app/ and the
 * copy would either break or smuggle in files nobody reviewed.
 */
function checkApp(): { files: number; dirs: number; bytes: number } {
  const st = statOrNull(APP_DIR);
  if (st === null) fail('app/: missing; the entry is a directory of static files with index.html at its root');
  if (!st!.isDirectory()) fail('app/: not a directory');

  let files = 0;
  let dirs = 0;
  let bytes = 0;
  const pending = [APP_DIR];
  while (pending.length > 0) {
    const dir = pending.pop()!;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        dirs++;
        pending.push(path);
      } else if (entry.isFile()) {
        files++;
        bytes += lstatSync(path).size;
      } else {
        fail(`app/${path.slice(APP_DIR.length + 1)}: a symlink or special file; app/ may hold only plain files and directories`);
      }
    }
  }
  const entries = files + dirs;
  if (entries > APP_MAX_ENTRIES) {
    fail(`app/: holds ${entries} files and directories, over the ${APP_MAX_ENTRIES} limit`);
  }
  if (bytes > APP_MAX_BYTES) {
    fail(`app/: files total ${bytes} bytes, over the ${APP_MAX_BYTES}-byte limit`);
  }

  // index.html is the page the judges open; without it there is nothing to load, and the dossier caps it at 1 MiB.
  const index = statOrNull(join(APP_DIR, 'index.html'));
  if (index === null || !index.isFile()) fail('app/index.html: missing; the app needs an index.html at its root');
  if (index!.size > INDEX_HTML_MAX_BYTES) {
    fail(`app/index.html: ${index!.size} bytes, over the ${INDEX_HTML_MAX_BYTES}-byte limit`);
  }
  return { files, dirs, bytes };
}

function main(): void {
  // Validate everything before touching the output directory, so a bad entry leaves no half-written output behind.
  const shots = checkScreenshots();
  const app = checkApp();

  mkdirSync(OUT_DIR, { recursive: true });
  // Clear only what this script owns, so a rerun into the same directory doesn't merge with a stale app/.
  for (const name of ['app', 'screenshots', 'dossier.json']) {
    rmSync(join(OUT_DIR, name), { recursive: true, force: true });
  }
  cpSync(APP_DIR, join(OUT_DIR, 'app'), { recursive: true });
  cpSync(SHOTS_DIR, join(OUT_DIR, 'screenshots'), { recursive: true });

  // Build from the output directory so the dossier describes exactly what was written there.
  const dossier = buildDossier(OUT_DIR, {
    text_max_bytes: TEXT_MAX_BYTES,
    screenshots: { max: SCREENSHOTS_MAX, max_bytes: SCREENSHOT_MAX_BYTES },
    app_max_files: APP_MAX_ENTRIES,
    app_max_bytes: APP_MAX_BYTES,
  });
  writeFileSync(join(OUT_DIR, 'dossier.json'), dossier);

  console.log(`wrote ${OUT_DIR}`);
  console.log(`  app/          ${app.files} files, ${app.dirs} directories, ${app.bytes} bytes`);
  console.log(`  screenshots/  ${shots.length} images (${shots.join(', ')})`);
  console.log(`  dossier.json  ${dossier.byteLength} bytes`);
}

try {
  main();
} catch (err) {
  // Our own refusals and the vendored DossierError both carry a readable message; anything else is unexpected,
  // but a one-line message is still more useful to the person running this than a stack.
  const message = err instanceof Error ? err.message : String(err);
  console.error(err instanceof EntryError ? `main.ts: ${message}` : `main.ts: ${err instanceof Error ? err.name : 'error'}: ${message}`);
  process.exit(1);
}

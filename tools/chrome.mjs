// Runs serve.ts and headless Chrome for the tools in this folder and drives a page over the DevTools protocol.
// withSite(fn) starts both, calls fn with a small page API, and stops both afterwards, even on failure.
//
//   page.open(path, { width, height })  load index.html at a hash path and wait for window.__shotReady
//   page.evaluate(expression)           run JavaScript in the page and return its value
//   page.problems                       console errors, exceptions, failed or off-site requests since the last open

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitFor(check, what, timeout = 15000) {
  const start = Date.now();
  for (;;) {
    try {
      const value = await check();
      if (value) return value;
    } catch {}
    if (Date.now() - start > timeout) throw new Error(`timed out waiting for ${what}`);
    await sleep(120);
  }
}

export async function withSite(fn) {
  // A random high port, checked to be this site, so another local server on a common port is never captured.
  const port = 18400 + Math.floor(Math.random() * 500);
  const debugPort = port + 1000;
  const origin = `http://localhost:${port}`;
  const server = spawn(process.execPath, ['serve.ts', '--port', String(port)], { cwd: root, stdio: 'ignore' });
  const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${debugPort}`, '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--force-color-profile=srgb', `--user-data-dir=/tmp/nusantara-chrome-${port}`, 'about:blank'], { stdio: 'ignore' });
  try {
    await waitFor(() => fetch(`http://127.0.0.1:${port}/`).then((r) => r.text()).then((t) => t.includes('Nusantara Statistics')), 'serve.ts');
    const targets = await waitFor(() => fetch(`http://127.0.0.1:${debugPort}/json/list`).then((r) => r.json()), 'Chrome');
    const socket = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      socket.onopen = resolve;
      socket.onerror = reject;
    });

    let nextId = 1;
    const pending = new Map();
    const problems = [];
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const params = message.params;
      if (message.id && pending.has(message.id)) {
        const { resolve, reject, method } = pending.get(message.id);
        pending.delete(message.id);
        if (message.error) reject(new Error(`${method}: ${message.error.message}`));
        else resolve(message.result);
      } else if (message.method === 'Runtime.exceptionThrown') {
        problems.push(`exception: ${params.exceptionDetails.exception?.description ?? params.exceptionDetails.text}`);
      } else if (message.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(params.type)) {
        problems.push(`console.${params.type}: ${params.args.map((a) => a.value ?? a.description).join(' ')}`);
      } else if (message.method === 'Network.loadingFailed') {
        problems.push(`request failed: ${params.errorText}`);
      } else if (message.method === 'Network.requestWillBeSent' && !params.request.url.startsWith(origin) && !params.request.url.startsWith('data:')) {
        problems.push(`off-site request: ${params.request.url}`);
      } else if (message.method === 'Network.responseReceived' && params.response.status >= 400) {
        problems.push(`HTTP ${params.response.status}: ${params.response.url}`);
      }
    };
    const send = (method, sendParams = {}) =>
      new Promise((resolve, reject) => {
        const id = nextId++;
        pending.set(id, { resolve, reject, method });
        socket.send(JSON.stringify({ id, method, params: sendParams }));
      });
    await send('Runtime.enable');
    await send('Network.enable');
    await send('Page.enable');

    const evaluate = async (expression) => {
      const { result, exceptionDetails } = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
      return result.value;
    };
    const page = {
      problems,
      send,
      evaluate,
      async open(path, { width = 1280, height = 800 } = {}) {
        const mobile = width < 600;
        await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile });
        await send('Emulation.setTouchEmulationEnabled', { enabled: mobile });
        problems.length = 0;
        await send('Page.navigate', { url: `${origin}/index.html?load=${Date.now()}${path}` });
        await waitFor(() => evaluate('window.__shotReady === true && document.readyState === "complete"'), `${path} to render`);
        await sleep(200);
      },
      waitFor,
      sleep,
    };
    const result = await fn(page);
    socket.close();
    return result;
  } finally {
    server.kill();
    chrome.kill();
  }
}

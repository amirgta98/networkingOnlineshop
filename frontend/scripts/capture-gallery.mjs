import { spawn } from 'child_process';
import fs from 'fs';

async function capture(url, outPath, width = 1200, height = 900) {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9223',
    '--user-data-dir=C:\\Users\\Dotcom\\AppData\\Local\\Temp\\chrome-debug-profile-gallery',
    '--disable-gpu',
    '--no-sandbox',
    `--window-size=${width},${height}`
  ]);

  await new Promise(r => setTimeout(r, 1500));

  try {
    let versionData = null;
    for (let i = 0; i < 20; i++) {
      try {
        const res = await fetch('http://127.0.0.1:9223/json/version');
        if (res.ok) {
          versionData = await res.json();
          break;
        }
      } catch (e) {
        await new Promise(r => setTimeout(r, 300));
      }
    }
    if (!versionData) throw new Error('Chrome failed to start');

    const newTabRes = await fetch(`http://127.0.0.1:9223/json/new?${encodeURIComponent(url)}`, { method: 'PUT' });
    const tabData = await newTabRes.json();

    const ws = new WebSocket(tabData.webSocketDebuggerUrl);
    let id = 1;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        callbacks.get(msg.id)(msg);
        callbacks.delete(msg.id);
      }
    };

    await new Promise(res => ws.onopen = res);

    function send(method, params = {}) {
      return new Promise((resolve) => {
        const msgId = id++;
        callbacks.set(msgId, resolve);
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false
    });

    console.log(`Waiting for ${url} to load...`);
    await new Promise(r => setTimeout(r, 3500));

    const screenshotRes = await send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false
    });

    fs.writeFileSync(outPath, Buffer.from(screenshotRes.result.data, 'base64'));
    console.log(`Saved screenshot to ${outPath}`);

    ws.close();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    chrome.kill();
  }
}

async function main() {
  await capture('http://localhost:3000/articles/l2-vs-l3-switch-comparison-guide', 'F:/work/Erfan/frontend/article-gallery-view.png');
  await new Promise(r => setTimeout(r, 1000));
  await capture('http://localhost:3000/portfolio/zagros-petrochemical-datacenter', 'F:/work/Erfan/frontend/portfolio-gallery-view.png');
}

main();

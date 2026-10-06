import { spawn } from 'child_process';
import fs from 'fs';

async function run() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--user-data-dir=C:\\Users\\Dotcom\\AppData\\Local\\Temp\\chrome-debug-profile',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=375,812'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  try {
    let versionData = null;
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9222/json/version');
      if (res.ok) {
        versionData = await res.json();
        break;
      }
    } catch (e) {
      await new Promise(r => setTimeout(r, 300));
    }
  }
  if (!versionData) throw new Error('Chrome failed to start');
  console.log('Browser version:', versionData.Browser);

  const newTabRes = await fetch('http://127.0.0.1:9222/json/new?http://localhost:3002/', { method: 'PUT' });
  const tabData = await newTabRes.json();
    console.log('Target tab ws:', tabData.webSocketDebuggerUrl);

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
      width: 375,
      height: 812,
      deviceScaleFactor: 2,
      mobile: true
    });

    console.log('Waiting for page load...');
    await new Promise(r => setTimeout(r, 3000));

    // Scroll to #special-offers and get bounding client rect
    const evalRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const el = document.querySelector('#special-offers');
        if (!el) return null;
        el.scrollIntoView();
        const rect = el.getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
      })()`,
      returnByValue: true
    });

    console.log('Eval res:', evalRes.result.value);
    await new Promise(r => setTimeout(r, 1000));

    // Capture screenshot
    const screenshotRes = await send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false
    });

    fs.writeFileSync('F:/work/Erfan/frontend/special-offers-view.png', Buffer.from(screenshotRes.result.data, 'base64'));
    console.log('Saved F:/work/Erfan/frontend/special-offers-view.png');

    ws.close();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    chrome.kill();
  }
}

run();

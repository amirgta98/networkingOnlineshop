import { spawn } from 'child_process';
import fs from 'fs';

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9224',
  '--user-data-dir=C:\\Users\\Dotcom\\AppData\\Local\\Temp\\chrome-debug-profile-mobile',
  '--disable-gpu',
  '--no-sandbox',
  '--window-size=390,844',
  'http://localhost:3000'
]);

async function capture() {
  await new Promise(r => setTimeout(r, 2000));
  const tabsRes = await fetch('http://127.0.0.1:9224/json');
  const tabs = await tabsRes.json();
  const tab = tabs.find(t => t.url.includes('localhost:3000'));
  if (!tab) {
    console.log('No tab found', tabs);
    chrome.kill();
    return;
  }
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 1;
  function send(method, params = {}) {
    return new Promise((resolve) => {
      const msgId = id++;
      const handler = (evt) => {
        const d = JSON.parse(evt.data);
        if (d.id === msgId) {
          ws.removeEventListener('message', handler);
          resolve(d.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await new Promise(r => setTimeout(r, 1500));

  const screenshot = await send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false
  });

  fs.writeFileSync('F:/work/Erfan/frontend/hero-real-mobile.png', Buffer.from(screenshot.data, 'base64'));
  console.log('Saved hero-real-mobile.png');

  ws.close();
  chrome.kill();
}

capture().catch(e => { console.error(e); chrome.kill(); });

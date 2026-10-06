import { spawn } from 'child_process';

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9225',
  '--user-data-dir=C:\\Users\\Dotcom\\AppData\\Local\\Temp\\chrome-debug-profile-eval',
  '--disable-gpu',
  '--no-sandbox',
  '--window-size=390,844',
  'http://localhost:3000'
]);

async function inspect() {
  await new Promise(r => setTimeout(r, 2000));
  const tabsRes = await fetch('http://127.0.0.1:9225/json');
  const tabs = await tabsRes.json();
  const tab = tabs.find(t => t.url.includes('localhost:3000'));
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
  await new Promise(r => setTimeout(r, 2000));

  const res = await send('Runtime.evaluate', {
    expression: `(() => {
      const h1 = document.querySelector('#hero-heading');
      if (!h1) return 'NO H1 FOUND!';
      const parent = h1.parentElement;
      const section = document.querySelector('section[aria-labelledby="hero-heading"]');
      const rectH1 = h1.getBoundingClientRect();
      const rectParent = parent.getBoundingClientRect();
      const styleH1 = window.getComputedStyle(h1);
      const styleParent = window.getComputedStyle(parent);
      return {
        h1: {
          text: h1.innerText,
          rect: { top: rectH1.top, left: rectH1.left, width: rectH1.width, height: rectH1.height },
          opacity: styleH1.opacity,
          display: styleH1.display,
          visibility: styleH1.visibility,
          color: styleH1.color,
          transform: styleH1.transform
        },
        parent: {
          rect: { top: rectParent.top, left: rectParent.left, width: rectParent.width, height: rectParent.height },
          opacity: styleParent.opacity,
          display: styleParent.display,
          visibility: styleParent.visibility,
          transform: styleParent.transform
        },
        section: section ? {
          rect: section.getBoundingClientRect(),
          childrenCount: section.children.length
        } : null
      };
    })()`,
    returnByValue: true
  });

  console.log('Result:', JSON.stringify(res.result.value, null, 2));
  ws.close();
  chrome.kill();
}

inspect().catch(e => { console.error(e); chrome.kill(); });

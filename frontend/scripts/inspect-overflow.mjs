import { spawn } from 'child_process';

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9223',
  '--user-data-dir=C:\\Users\\Dotcom\\AppData\\Local\\Temp\\chrome-debug-profile-inspect',
  '--disable-gpu',
  '--no-sandbox',
  '--window-size=390,844',
  'http://localhost:3000'
]);

async function check() {
  await new Promise(r => setTimeout(r, 2000));
  const tabsRes = await fetch('http://127.0.0.1:9223/json');
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
  await new Promise(r => setTimeout(r, 2000));

  const res = await send('Runtime.evaluate', {
    expression: `(() => {
      const docWidth = document.documentElement.clientWidth;
      const overflowing = [];
      document.querySelectorAll('*').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.right > docWidth + 1 || rect.left < -1) {
          overflowing.push({
            tag: el.tagName,
            id: el.id,
            className: typeof el.className === 'string' ? el.className.slice(0, 80) : '',
            left: rect.left,
            right: rect.right,
            width: rect.width,
            docWidth
          });
        }
      });
      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        scrollLeft: document.documentElement.scrollLeft,
        bodyScrollWidth: document.body.scrollWidth,
        overflowing: overflowing.slice(0, 15)
      };
    })()`,
    returnByValue: true
  });

  console.log(JSON.stringify(res.result.value, null, 2));
  ws.close();
  chrome.kill();
}

check().catch(e => { console.error(e); chrome.kill(); });

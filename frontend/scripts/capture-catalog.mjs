import { spawn } from 'child_process';
import fs from 'fs';

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9226',
  '--user-data-dir=C:\\Users\\Dotcom\\AppData\\Local\\Temp\\chrome-debug-profile-catalog2',
  '--disable-gpu',
  '--no-sandbox',
  '--window-size=1280,1000',
  'http://localhost:3000'
]);

async function capture() {
  await new Promise(r => setTimeout(r, 2500));
  const tabsRes = await fetch('http://127.0.0.1:9226/json');
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
  await new Promise(r => setTimeout(r, 1500));

  // Count products on home page
  const homeProductCards = await send('Runtime.evaluate', {
    expression: `
      document.querySelectorAll('#catalog article, #catalog [data-testid="product-card"], #catalog .grid > div').length
    `
  });
  console.log('Home page products count:', homeProductCards.result?.value);

  // Scroll directly to the "View all products" button
  await send('Runtime.evaluate', {
    expression: `
      const buttons = Array.from(document.querySelectorAll('button, a'));
      const viewAllBtn = buttons.find(b => b.textContent && b.textContent.includes('تماشای همه محصولات'));
      if (viewAllBtn) {
        viewAllBtn.scrollIntoView({ behavior: 'instant', block: 'center' });
      }
    `
  });
  await new Promise(r => setTimeout(r, 1000));

  const buttonScreenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('F:/work/Erfan/frontend/catalog-button-view.png', Buffer.from(buttonScreenshot.data, 'base64'));
  console.log('Saved catalog-button-view.png');

  ws.close();
  chrome.kill();
}

capture().catch(e => { console.error(e); chrome.kill(); });

import { spawn } from 'child_process';
import http from 'http';

async function run() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edge = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    'http://localhost:5173/'
  ]);

  // wait 2 seconds for edge to open
  await new Promise(r => setTimeout(r, 2000));

  try {
    const listRes = await fetch('http://127.0.0.1:9222/json');
    const tabs = await listRes.json();
    console.log('Tabs:', tabs);

    const pageTab = tabs.find(t => t.type === 'page');
    if (!pageTab) {
      console.log('No page tab found');
      edge.kill();
      return;
    }

    const wsUrl = pageTab.webSocketDebuggerUrl;
    const WebSocket = (await import('ws')).default || globalThis.WebSocket;
    const ws = new WebSocket(wsUrl);

    await new Promise(resolve => ws.on('open', resolve));
    console.log('Connected to CDP WebSocket');

    let id = 1;
    function send(method, params = {}) {
      const msgId = id++;
      ws.send(JSON.stringify({ id: msgId, method, params }));
    }

    ws.on('message', data => {
      const msg = JSON.parse(data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        console.log('[BROWSER CONSOLE]', msg.params.type, msg.params.args.map(a => a.value || a.description).join(' '));
      } else if (msg.method === 'Runtime.exceptionThrown') {
        console.error('[BROWSER EXCEPTION]', msg.params.exceptionDetails);
      }
    });

    send('Runtime.enable');
    send('Page.enable');

    // Wait 2s for page to settle
    await new Promise(r => setTimeout(r, 2000));

    console.log('Simulating scroll down...');
    // Evaluate scroll in browser
    send('Runtime.evaluate', {
      expression: `
        (async () => {
          console.log('Start scrolling from top');
          for (let i = 0; i < 20; i++) {
            window.scrollBy(0, 300);
            await new Promise(r => setTimeout(r, 100));
          }
          console.log('Finished scrolling, current scrollY:', window.scrollY);
        })()
      `
    });

    // Wait 5s for any errors to occur
    await new Promise(r => setTimeout(r, 5000));

  } catch (err) {
    console.error('CDP Error:', err);
  } finally {
    edge.kill();
  }
}

run();

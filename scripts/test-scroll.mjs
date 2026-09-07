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
    const ws = new globalThis.WebSocket(wsUrl);

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });
    console.log('Connected to CDP WebSocket');

    let id = 1;
    function send(method, params = {}) {
      const msgId = id++;
      ws.send(JSON.stringify({ id: msgId, method, params }));
    }

    send('Runtime.enable');
    send('Page.enable');
    send('Network.enable');

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        console.log('[BROWSER CONSOLE]', msg.params.type, msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' '));
      } else if (msg.method === 'Runtime.exceptionThrown') {
        console.error('[BROWSER EXCEPTION]', JSON.stringify(msg.params.exceptionDetails, null, 2));
      } else if (msg.method === 'Network.loadingFailed') {
        console.error('[NET FAILED]', msg.params.requestId, msg.params.errorText, msg.params.canceled);
      } else if (msg.method === 'Network.responseReceived') {
        if (msg.params.response.status >= 400 || msg.params.response.url.includes('Scene')) {
          console.log('[NET RESPONSE]', msg.params.response.status, msg.params.response.url);
        }
      }
    };

    // Wait 2s for page to settle
    await new Promise(r => setTimeout(r, 2000));

    console.log('Simulating deep scroll to bottom...');
    send('Runtime.evaluate', {
      expression: `
        (async () => {
          console.log('Document scrollHeight:', document.documentElement.scrollHeight);
          const total = document.documentElement.scrollHeight - window.innerHeight;
          console.log('Total scrollable pixels:', total);
          const steps = 30;
          for (let i = 1; i <= steps; i++) {
            const targetY = (total / steps) * i;
            window.scrollTo(0, targetY);
            // Also trigger standard scroll event in case
            window.dispatchEvent(new Event('scroll'));
            await new Promise(r => setTimeout(r, 150));
            if (i % 5 === 0) {
              console.log('Scrolled to step', i, 'scrollY:', window.scrollY, 'target:', targetY);
            }
          }
          console.log('Finished deep scroll, final scrollY:', window.scrollY);
          // Check if error overlay or error text is in DOM
          const hasError = document.body.innerText.includes("Something went wrong");
          console.log('Has Error Text in DOM?:', hasError);
        })()
      `
    });

    // Wait 7s for scroll to complete and any errors to occur
    await new Promise(r => setTimeout(r, 7000));

  } catch (err) {
    console.error('CDP Error:', err);
  } finally {
    edge.kill();
  }
}

run();

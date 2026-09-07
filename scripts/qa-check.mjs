const routes = [
  '/',
  '/about',
  '/services',
  '/services/structural-design',
  '/services/plans-approval',
  '/services/architecture-design',
  '/services/interior-design',
  '/walkthrough',
  '/construction',
  '/contact',
  '/404-test'
];

async function check() {
  console.log('Testing all routes against http://localhost:5173...');
  for (const r of routes) {
    try {
      const res = await fetch(`http://localhost:5173${r}`);
      console.log(`Route [${r}] => Status ${res.status}`);
      if (res.status >= 400 && r !== '/404-test') {
        console.error(`ERROR: Route ${r} returned status ${res.status}`);
      }
    } catch (err) {
      console.error(`FAILED: Route ${r}`, err.message);
    }
  }
}

check();

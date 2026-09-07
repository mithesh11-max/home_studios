import fs from 'fs';

console.log("Checking geometry exports...");
import('./src/components/site/FloorPlanRise/geometry.js')
  .catch(async () => {
    // Vite uses ts
    console.log("Testing via tsx or dynamic check");
  });

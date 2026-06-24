import dotenv from 'dotenv';
dotenv.config();

import { triggerHitungSMART } from '../src/services/smartService.js';

const tahunAjaranId = process.argv[2];
if (!tahunAjaranId) {
  console.error('Usage: node scripts/runSmart.js <tahunAjaranId>');
  process.exit(1);
}

(async () => {
  try {
    console.log('Starting SMART trigger for', tahunAjaranId);
    await triggerHitungSMART({ tahunAjaranId });
    console.log('SMART calculation finished');
    process.exit(0);
  } catch (err) {
    console.error('SMART trigger error:', err);
    process.exit(2);
  }
})();

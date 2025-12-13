import { cache } from '../lib/cache';

async function clearCache() {
  console.log('Clearing companies cache...');
  await cache.invalidatePattern('companies:all');
  console.log('Cache cleared.');
  process.exit(0);
}

clearCache();

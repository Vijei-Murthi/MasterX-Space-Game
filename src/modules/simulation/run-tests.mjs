import { register } from 'node:module';

register('./ts-resolver.mjs', import.meta.url);

// Execute the test file
await import('./simulation.test.ts');

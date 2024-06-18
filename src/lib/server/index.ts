import { uniquePool } from './pool.svelte';
import { createWatcher } from './watcher.svelte';

export type Watcher = ReturnType<typeof createWatcher>;

export { uniquePool, createWatcher };

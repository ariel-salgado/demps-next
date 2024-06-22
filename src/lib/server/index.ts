import { uniquePool } from './pool.svelte';
import { runDempsSim } from './simulator.svelte';
import { createWatcher } from './watcher.svelte';

export type Watcher = ReturnType<typeof createWatcher>;
export type DempsProcess = ReturnType<typeof runDempsSim>;

export { uniquePool, createWatcher, runDempsSim };

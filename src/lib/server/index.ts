import { createDempsProcess } from './simulator.svelte';
import { createWatcher } from './watcher.svelte';
import { createFileProcessor } from './file-processor.svelte';

export type Watcher = ReturnType<typeof createWatcher>;
export type DempsProcess = ReturnType<typeof createDempsProcess>;

export { createWatcher, createDempsProcess, createFileProcessor };

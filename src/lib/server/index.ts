import { createWatcher } from './watcher.svelte';
import { createFileProcessor } from './file-processor.svelte';

export type Watcher = ReturnType<typeof createWatcher>;

export { createWatcher, createFileProcessor };

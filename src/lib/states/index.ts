import { createEnvironment } from './environment.svelte';

export type Environment = ReturnType<typeof createEnvironment>;

export const environment = createEnvironment();

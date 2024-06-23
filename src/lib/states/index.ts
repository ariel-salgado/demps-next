import { createUniquePool } from './pool.svelte';
import { createEnvironment } from './environment.svelte';

export type UniquePool = ReturnType<typeof createUniquePool>;
export type Environment = ReturnType<typeof createEnvironment>;

export const uniquePool = createUniquePool();
export const environment = createEnvironment();

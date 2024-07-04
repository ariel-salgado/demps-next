import { createUniquePool } from './pool.svelte';
import { createParameters } from './parameters.svelte';
import { createEnvironment } from './environment.svelte';

export type UniquePool = ReturnType<typeof createUniquePool>;
export type Parameters = ReturnType<typeof createParameters>;
export type Environment = ReturnType<typeof createEnvironment>;

export const uniquePool = createUniquePool();
export const parameters = createParameters();
export const environment = createEnvironment();

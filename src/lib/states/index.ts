import { createUniquePool } from './pool.svelte';
import { extractDefaultValues } from '$lib/utils';
import { parametersFormFields } from '$lib/config';
import { createParameters } from './parameters.svelte';
import { createEnvironment } from './environment.svelte';

export type UniquePool = ReturnType<typeof createUniquePool>;
export type Parameters = ReturnType<typeof createParameters>;
export type Environment = ReturnType<typeof createEnvironment>;

export const uniquePool = createUniquePool();
export const environment = createEnvironment();
export const parameters = createParameters(extractDefaultValues(parametersFormFields));

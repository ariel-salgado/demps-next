import { Map } from 'svelte/reactivity';

function createUniquePool() {
	const pool = new Map();

	function add(key: string, value: any, replace?: boolean) {
		if (pool.has(key) && !replace) {
			throw new Error(`Value with ${key} already exists.`);
		}

		pool.set(key, value);
	}

	function has(key: string) {
		return pool.has(key);
	}

	function get<T>(key: string): T {
		return pool.get(key) as T;
	}

	function pop<T>(key: string): T | undefined {
		if (!pool.has(key)) {
			throw new Error(`Value with ${key} does not exist.`);
		}

		const value = pool.get(key);
		pool.delete(key);

		return value as T;
	}

	function remove(key: string) {
		if (!pool.has(key)) {
			throw new Error(`Value with ${key} does not exist.`);
		}

		pool.delete(key);
	}

	return {
		add,
		has,
		get,
		pop,
		remove
	};
}

export const uniquePool = createUniquePool();

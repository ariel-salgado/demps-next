import { loadLocalStorage, saveLocalStorage } from '$lib/utils';

export function createPersisted<T>(key: string, initialValue?: T) {
	let _value: T | undefined = $state(initialValue);

	$effect.root(() => {
		const stored = loadLocalStorage<T>(key);
		_value = (stored || initialValue) as T;

		$effect(() => {
			saveLocalStorage(key, _value);
		});
	});

	return {
		get value(): T | undefined {
			return _value;
		},
		set value(newValue: T) {
			_value = newValue;
		}
	};
}

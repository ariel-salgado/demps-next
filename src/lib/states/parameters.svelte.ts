import { loadLocalStorage, saveLocalStorage } from '$lib/utils';

export function createParameters(parameters?: Record<string, string>) {
	let _parameters: Record<string, string> | null = $state({});

	$effect.root(() => {
		const stored = loadLocalStorage<Record<string, string>>('parameters');
		const init = stored ? stored : parameters || {};

		_parameters = init;

		$effect(() => {
			saveLocalStorage('parameters', $state.snapshot(_parameters));
		});

		return () => {
			_parameters = null;
		};
	});

	return {
		get value() {
			return _parameters as Record<string, string>;
		},
		set value(newValue: Record<string, string>) {
			_parameters = newValue;
		}
	};
}

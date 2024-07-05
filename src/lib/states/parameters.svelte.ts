import type { ParametersSchema } from '$lib/types';

import { loadLocalStorage, saveLocalStorage } from '$lib/utils';

type PartialParameters = Partial<ParametersSchema>;

export function createParameters(parameters?: PartialParameters) {
	let _parameters: PartialParameters | null = $state({});

	$effect.root(() => {
		const stored = loadLocalStorage<PartialParameters>('parameters');
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
			return _parameters as PartialParameters;
		},
		set value(newValue: PartialParameters) {
			_parameters = newValue;
		}
	};
}

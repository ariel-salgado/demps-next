import type { Action } from 'svelte/action';

import { on } from 'svelte/events';

function validateNumericInput({ target, key, preventDefault }: KeyboardEvent) {
	const { selectionStart, value } = target as HTMLInputElement;
	const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];

	if (allowedKeys.includes(key)) return;

	const hasMinusSign = value.includes('-');
	const hasDecimalPoint = value.includes('.');

	const shouldPreventDefault =
		(key === '-' && (selectionStart !== 0 || hasMinusSign)) ||
		(key === '.' && (hasDecimalPoint || selectionStart === 0)) ||
		!/[\d.-]/.test(key);

	if (shouldPreventDefault) {
		preventDefault();
	}
}

const initInput: Action<HTMLInputElement> = (element) => {
	let onKeyDown: (() => void) | undefined = $state();

	if (element.type === 'number') {
		onKeyDown = on(element, 'keydown', validateNumericInput);
	}

	element.type = 'text';

	return {
		destroy() {
			onKeyDown?.();
			element.remove();
		}
	};
};

const baseStyle =
	'flex h-9 w-full bg-white rounded-md border border-slate-300 px-3 py-2 text-sm ring-offset-white read-only:cursor-not-allowed read-only:select-none read-only:bg-slate-100 read-only:text-slate-700 read-only:ring-offset-slate-100 focus-within:outline-none focus-within:ring-2 focus-within:ring-slate-700 focus-within:ring-offset-2 read-only:focus-within:ring-opacity-0';

export { initInput, baseStyle };

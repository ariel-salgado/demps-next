<script lang="ts">
	import type { z } from 'zod';
	import type { Action } from 'svelte/action';
	import type { HTMLInputAttributes } from 'svelte/elements';

	import { cn } from '$lib/utils';
	import { baseStyle, onlyAllowNumbers } from './props';

	interface Props extends HTMLInputAttributes {
		validation?: z.ZodType;
	}

	let {
		type: type,
		value: value = $bindable(),
		class: className,
		validation,
		...rest
	}: Props = $props();

	let validationError: boolean = $state(false);
	let inputError: string | undefined = $state();

	function validateField() {
		if (!validation) return;

		const { success, error } = validation.safeParse(value);

		if (success) {
			validationError = false;
			return;
		}

		validationError = true;
		inputError = error.format()._errors.at(0);
		return;
	}

	const initInput: Action<HTMLInputElement> = (element: HTMLInputElement) => {
		if (type !== 'number') element.type = 'text';

		if (type === 'number') {
			element.addEventListener('keydown', onlyAllowNumbers);
		}

		return {
			destroy() {
				element.removeEventListener('keydown', onlyAllowNumbers);
				element.remove();
			}
		};
	};
</script>

<input
	{...rest}
	class={cn(baseStyle, className)}
	class:error={validationError}
	onchange={validation ? validateField : undefined}
	use:initInput
	bind:value
/>

{#if validationError}
	<small class="text-red-600">{inputError}</small>
{/if}

<style lang="postcss">
	.error {
		@apply border-2 border-red-600 focus-within:ring-red-600;
	}
</style>

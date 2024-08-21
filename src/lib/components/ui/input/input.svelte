<script lang="ts">
	import type { z } from 'zod';
	import type { HTMLInputAttributes } from 'svelte/elements';

	import { cn } from '$lib/utils';
	import { baseStyle } from './props';

	interface Props extends HTMLInputAttributes {
		validation?: z.ZodType;
	}

	let { value: value = $bindable(), class: className, validation, ...rest }: Props = $props();

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
</script>

<input
	{...rest}
	class:error={validationError}
	class={cn(
		baseStyle,
		`${validationError ? 'border-2 border-red-600 focus-within:ring-red-600' : ''}`,
		className
	)}
	onchange={validation ? validateField : undefined}
	bind:value
/>

{#if validationError}
	<small class="text-red-600">{inputError}</small>
{/if}

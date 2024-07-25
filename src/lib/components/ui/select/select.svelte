<script lang="ts">
	import type { z } from 'zod';
	import type { SelectOptions } from '$lib/types';
	import type { HTMLSelectAttributes } from 'svelte/elements';

	import { cn } from '$lib/utils';
	import { baseStyle } from './props';

	interface Props extends HTMLSelectAttributes {
		value?: string | number;
		placeholder?: string | null;
		options: SelectOptions;
		validation?: z.ZodType;
	}

	let {
		value = $bindable(),
		options,
		placeholder,
		class: className,
		validation,
		...rest
	}: Props = $props();

	const hasDefaultValue = options.some((option) => option.selected === true);

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
	}
</script>

<select
	class:error={validationError}
	class={cn(
		baseStyle,
		`${validationError ? 'border-2 border-red-600 focus-within:ring-red-600' : ''}`,
		className
	)}
	onchange={validation ? validateField : undefined}
	{...rest}
	bind:value
>
	{#if placeholder}
		<option disabled selected={!hasDefaultValue}>{placeholder}</option>
	{/if}
	{#each options as { label, value, selected }}
		<option {value} {selected}>{label}</option>
	{/each}
</select>

{#if validationError}
	<small class="text-red-600">{inputError}</small>
{/if}

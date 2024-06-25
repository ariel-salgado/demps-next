<script lang="ts">
	import type { FormField, FormSchema } from '$lib/types';

	import { page } from '$app/stores';
	import { parametersFormFields } from '$lib/config';
	import { FormGroup, Label, Input, Select, Description } from '$lib/components/ui';

	let selected: string = $state($page.url.hash.slice(1) || 'general');

	$effect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					const sectionId = entry.target.id;

					if (entry.isIntersecting) {
						selected = sectionId;
					}
				});
			},
			{ threshold: 1, rootMargin: '-12px 0px -75% 0px' }
		);

		const sections = document.querySelectorAll('.observed');

		sections.forEach((section) => {
			observer.observe(section);
		});
	});
</script>

{#snippet navItems(items: FormSchema, isNested: boolean)}
	{#each Object.entries(items) as [key, value]}
		<li
			class={`rounded-md text-base font-medium text-slate-500 transition-colors focus-within:bg-slate-100 focus-within:text-slate-700 hover:bg-slate-100 hover:text-slate-700 ${isNested && `pl-4`} ${selected === key && `bg-slate-700 text-white focus-within:bg-slate-700 focus-within:text-white hover:bg-slate-700 hover:text-white`}`}
		>
			<a href={`#${key}`} class="block py-1.5 px-4 capitalize">{key}</a>
		</li>

		{#if !Array.isArray(value)}
			{@render navItems(value, true)}
		{/if}
	{/each}
{/snippet}

{#snippet parametersForm(fields: FormSchema, isNested: boolean)}
	{#each Object.entries(fields) as [key, value]}
		<div class={`grid scroll-m-24 grid-cols-2 gap-2 first:mt-0 ${isNested && 'col-span-2'}`}>
			{#if isNested}
				<h3
					id={key}
					class="observed col-span-2 mt-4 mb-2 scroll-m-20 px-5 text-2xl font-semibold capitalize tracking-tight"
				>
					{key}
				</h3>
			{:else}
				<h2
					id={key}
					class="observed col-span-2 scroll-m-24 border-b border-slate-300 px-5 pb-2 text-3xl font-semibold capitalize tracking-tight"
				>
					{key}
				</h2>
			{/if}
			{#if Array.isArray(value)}
				{#each value as field}
					{@render formField(field)}
				{/each}
			{:else}
				{@render parametersForm(value, true)}
			{/if}
		</div>
	{/each}
{/snippet}

{#snippet formField(field: FormField)}
	<FormGroup>
		<Label for={field.attributes.name}>{field.label}</Label>
		{#if field.type === 'input'}
			<Input id={field.attributes.name} {...field.attributes} validation={field.validation} />
		{:else if field.type === 'select'}
			<Select
				id={field.attributes.name}
				{...field.attributes}
				options={field.options}
				validation={field.validation}
			/>
		{/if}
		{#if field.description}
			<Description>{field.description}</Description>
		{/if}
	</FormGroup>
{/snippet}

<svelte:head>
	<title>DEMPS | Parameters</title>
	<meta name="description" content="Configuración de parámetros" />
</svelte:head>

<section class="grid grid-cols-[22rem_1fr] divide-x divide-slate-300">
	<aside
		class="sticky top-14 flex h-[calc(100vh-4rem)] flex-1 flex-col justify-between p-10 shadow"
	>
		<div>
			<h2 class="border-b border-slate-300 px-5 pb-2 text-3xl font-semibold tracking-tight">
				Navegación
			</h2>

			<nav>
				<ul class="space-y-1 py-4">
					{@render navItems(parametersFormFields, false)}
				</ul>
			</nav>
		</div>
		<div>buttons</div>
	</aside>
	<form class="space-y-10 py-10 px-12" method="POST" action="?/download" data-sveltekit-keepfocus>
		{@render parametersForm(parametersFormFields, false)}
	</form>
</section>

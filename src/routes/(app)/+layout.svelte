<script lang="ts">
	import '../../app.css';

	import { Toaster } from 'svelte-sonner';
	import { Header } from '$lib/components/ui';
	import { onNavigate } from '$app/navigation';

	const { children } = $props();

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<div class="grid min-h-screen grid-rows-[auto_1fr_auto]">
	<Header />

	<main>
		{@render children()}
	</main>

	<footer></footer>
</div>

<Toaster position="bottom-left" />

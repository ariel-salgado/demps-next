<script lang="ts">
	import { Button } from '$lib/components/ui';

	interface NavLinks {
		label: string;
		href: string;
	}

	const navLinks: NavLinks[] = [{ label: 'inicio', href: '/' }];
</script>

<header class="z-[999] flex h-16 items-center justify-around shadow">
	<a class="text-3xl font-bold" href="/">DEMPS</a>

	<nav>
		<ul class="flex items-center gap-x-4">
			{#each navLinks as { label, href }}
				<li>
					<a {href}>{label}</a>
				</li>
			{/each}
		</ul>
	</nav>

	<div class="flex">
		<Button>Simular</Button>
	</div>
</header>

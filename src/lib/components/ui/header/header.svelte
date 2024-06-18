<script lang="ts">
	import { Button } from '$lib/components/ui';

	interface NavLinks {
		label: string;
		href: string;
	}

	const navLinks: NavLinks[] = [
		{ label: 'inicio', href: '/' },
		{ label: 'entorno', href: '/' },
		{ label: 'parámetros', href: '/' }
	];
</script>

<header class="z-[999] flex h-16 items-center justify-around shadow">
	<a class="text-3xl font-bold" href="/">DEMPS</a>

	<nav>
		<ul class="flex items-center gap-x-3">
			{#each navLinks as { label, href }}
				<li>
					<Button as="a" variant="link" class="py-0 px-3" {href}>{label}</Button>
				</li>
			{/each}
		</ul>
	</nav>

	<div class="flex">
		<Button as="a" href="/simulacion" aria-label="Iniciar simulación">
			<span>Simulación</span>
		</Button>
	</div>
</header>

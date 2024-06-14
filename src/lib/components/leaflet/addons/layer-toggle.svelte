<script lang="ts">
	import type { MapContext } from '$lib/components/leaflet';

	import { contextKey } from '$lib/components/leaflet';
	import { getContext, onDestroy, onMount } from 'svelte';

	let { overlayLayer } = getContext<MapContext>(contextKey);

	let hiddenLayers: boolean = $state(false);

	window.L.Control.Layers.include({
		showLayers: function () {
			for (const i in this._layers) {
				if (this._layers[i].overlay) {
					if (!this._map.hasLayer(this._layers[i].layer)) {
						this._map.addLayer(this._layers[i].layer);
					}
				}
			}
		},
		hideLayers: function () {
			for (const i in this._layers) {
				if (this._layers[i].overlay) {
					if (this._map.hasLayer(this._layers[i].layer)) {
						this._map.removeLayer(this._layers[i].layer);
					}
				}
			}
		}
	});

	function toggleLayers() {
		if (hiddenLayers) {
			// @ts-expect-error - Custom method to show/hide layers
			overlayLayer?.showLayers();
		} else {
			// @ts-expect-error - Custom method to show/hide layers
			overlayLayer?.hideLayers();
		}

		hiddenLayers = !hiddenLayers;
	}

	const toolbar = document.querySelector('div[class="leaflet-top leaflet-left"');
	const layerToggle = document.createElement('div');

	layerToggle.classList.add(
		'clear-both',
		'float-left',
		'relative',
		'z-[8]',
		'pointer-events-auto',
		'ml-[10px]',
		'mt-[10px]',
		'cursor-auto',
		'overflow-hidden',
		'rounded-[0.25rem]',
		'border-2',
		'border-black/20'
	);

	layerToggle.innerHTML = `
			<div class="relative">
				<button
					id="layer-toggle"
					class="flex items-center justify-center cursor-pointer z-[2] size-[30px] leading-[30px] p-[5px] relative border-0 border-solid border-[#E5E7EB] bg-white focus-within:bg-[#F4F4F4] hover:bg-[#F4F4F4]"
					aria-label="Toggle Layers"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="size-full block stroke-[#5B5B5B] stroke-[2.5]"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
						/>
					</svg>
				</button>
			</div>
		`;

	toolbar?.appendChild(layerToggle);
	const layerToggleBtn = document.getElementById('layer-toggle');

	onMount(() => {
		layerToggleBtn?.addEventListener('click', toggleLayers);
	});

	onDestroy(() => {
		layerToggleBtn?.removeEventListener('click', toggleLayers);
	});
</script>

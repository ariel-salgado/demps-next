<script lang="ts">
	import type { Control } from 'leaflet';
	import type { Action } from 'svelte/action';
	import type { MapContext } from '$lib/components/leaflet';

	import { getContext } from 'svelte';
	import { mapContextKey } from '$lib/components/leaflet';

	interface ToggleLayer extends Control.Layers {
		showLayers(): void;
		hideLayers(): void;
	}

	let { overlayLayer } = getContext<MapContext>(mapContextKey);

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
			(overlayLayer as ToggleLayer).showLayers();
		} else {
			(overlayLayer as ToggleLayer).hideLayers();
		}

		hiddenLayers = !hiddenLayers;
	}

	const initToggle: Action<HTMLElement> = (node) => {
		const toolbar = document.querySelector('div[class="leaflet-top leaflet-left"');
		toolbar?.appendChild(node);

		return {
			destroy() {
				node.remove();
			}
		};
	};
</script>

<div
	class="pointer-events-auto relative z-[8] float-left clear-both mt-[10px] ml-[10px] cursor-auto overflow-hidden rounded-[0.25rem] border-2 border-black/20"
	use:initToggle
>
	<div class="relative" title="Alternar capas">
		<button
			class="relative z-[2] flex size-[30px] cursor-pointer items-center justify-center border-0 border-solid border-[#E5E7EB] bg-white p-[5px] leading-[30px] focus-within:bg-[#F4F4F4] hover:bg-[#F4F4F4]"
			aria-label="Alternar capas"
			onclick={toggleLayers}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="block size-full stroke-[#5B5B5B] stroke-[2.5]"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
				/>
			</svg>
		</button>
	</div>
</div>

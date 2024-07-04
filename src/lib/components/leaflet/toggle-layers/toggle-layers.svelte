<script lang="ts">
	import type { Control } from 'leaflet';
	import type { Action } from 'svelte/action';
	import type { MapContext } from '$lib/components/leaflet';

	import { getContext } from 'svelte';
	import { EyeOff } from 'lucide-svelte';
	import { contextKey } from '$lib/components/leaflet';

	interface ToggleLayer extends Control.Layers {
		showLayers(): void;
		hideLayers(): void;
	}

	let { overlayLayer } = getContext<MapContext>(contextKey);

	let hiddenLayers: boolean | null = $state(false);

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
		toolbar?.firstChild?.after(node);

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

		return {
			destroy() {
				node.remove();
				hiddenLayers = null;
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
			<EyeOff class="stroke-[#5B5B5B] stroke-[2.5]" />
		</button>
	</div>
</div>

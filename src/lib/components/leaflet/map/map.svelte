<script context="module" lang="ts">
	export const contextKey = Symbol();
</script>

<script lang="ts">
	import type { G } from '$lib/types';
	import type { Feature } from 'geojson';
	import type { Action } from 'svelte/action';
	import type { Environment } from '$lib/states';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Control, FeatureGroup, Map, MapOptions } from 'leaflet';

	import { cn } from '$lib/utils/utils';
	import { setContext } from 'svelte';

	type Parameters = Environment | undefined;

	type MapAction = Action<HTMLElement, Parameters>;

	interface Props extends HTMLAttributes<HTMLDivElement> {
		zoom?: number;
		center?: [number, number];
		environment?: Environment;
	}

	let {
		children,
		zoom,
		center,
		environment = $bindable(),
		class: className,
		...rest
	}: Props = $props();

	let map: Map | undefined = $state();
	let featureGroup: FeatureGroup | undefined = $state();
	let overlayLayer: Control.Layers | undefined = $state();

	setContext(contextKey, {
		get map() {
			return map;
		},
		get environment() {
			return environment;
		},
		get featureGroup() {
			return featureGroup;
		},
		get overlayLayer() {
			return overlayLayer;
		}
	});

	// @ts-expect-error - Svelte action can't be async, but works anyway
	const initMap: MapAction = async (mapContainer, environment) => {
		if (!window.L) {
			await import('leaflet');
			await import('leaflet/dist/leaflet.css');
		}

		featureGroup = new window.L.FeatureGroup();
		overlayLayer = new window.L.Control.Layers();

		const rasterLayer = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			keepBuffer: 32,
			updateWhenIdle: true,
			updateWhenZooming: false,
			attribution:
				'© <a href="https://www.openstreetmap.org/copyright" target="_blank">OSM Contributors</a>'
		});

		const mapOptions: MapOptions = {
			zoom: zoom,
			center: center,
			preferCanvas: true,
			layers: [rasterLayer],
			renderer: new window.L.Canvas()
		};

		map = new window.L.Map(mapContainer, mapOptions);

		map.whenReady(() => {
			map?.invalidateSize();
			map?.addLayer(featureGroup!);

			$effect.root(() => {
				$effect(() => {
					if (environment) {
						loadFeatures(environment.getFeatures());
					}
				});

				return () => clearLayers();
			});
		});

		return {
			destroy() {
				map?.remove();
				map = undefined;
				mapContainer.remove();
			}
		};
	};

	function clearLayers() {
		featureGroup?.eachLayer((layer) => {
			overlayLayer?.removeLayer(layer);
		});
		featureGroup?.clearLayers();
	}

	function loadFeatures(features: Feature<G>[]) {
		clearLayers();

		window.L.geoJSON(features, {
			style: () => {
				return {};
			},
			onEachFeature(feature, layer) {
				const { radius, center, nameID } = feature.properties;

				if (radius && center.length > 0) {
					const _center = new window.L.LatLng(center[0], center[1]);
					layer = new window.L.Circle(_center, radius).setStyle(layer.options);
				}

				Object.defineProperty(layer, 'id', { value: feature.id, writable: false });

				featureGroup?.addLayer(layer);
				overlayLayer?.addOverlay(layer, nameID || feature.id);
			}
		});
	}
</script>

<svelte:head>
	<link rel="preconnect" href="https://a.tile.openstreetmap.org" fetchpriority="high" />
	<link rel="preconnect" href="https://b.tile.openstreetmap.org" fetchpriority="high" />
	<link rel="preconnect" href="https://c.tile.openstreetmap.org" fetchpriority="high" />
	<link rel="dns-prefetch" href="https://a.tile.openstreetmap.org" fetchpriority="high" />
	<link rel="dns-prefetch" href="https://b.tile.openstreetmap.org" fetchpriority="high" />
	<link rel="dns-prefetch" href="https://c.tile.openstreetmap.org" fetchpriority="high" />
</svelte:head>

<div class={cn('size-full outline-none', className)} {...rest} use:initMap={environment}>
	{#if map && children}
		{@render children()}
	{/if}
</div>

<script lang="ts">
	import type { G } from '$lib/types';
	import type { Action } from 'svelte/action';
	import type { Environment } from '$lib/states';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Feature, FeatureCollection } from 'geojson';
	import type { Map, MapOptions, FeatureGroup, Control, Layer, Path } from 'leaflet';

	import { cn } from '$lib/utils';
	import { setContext } from 'svelte';
	import { LoaderCircle } from 'lucide-svelte';
	import { contextKey, createPopup } from '$lib/components/leaflet';
	import {
		attachPopupEvents,
		geoJSONToGeometry,
		getStylesFromFeature,
		updateFeatureProperties
	} from '$lib/components/leaflet/helpers';

	type Parameters = Environment | undefined;

	type MapAction = Action<HTMLElement, Parameters>;

	interface Props extends HTMLAttributes<HTMLDivElement> {
		zoom?: number;
		center?: [number, number];
		environment?: Environment;
		reload?: boolean;
	}

	let {
		children,
		zoom = 15,
		center = [-33.015348, -71.550002],
		environment,
		reload = $bindable(),
		class: className,
		...rest
	}: Props = $props();

	let map: Map | undefined = $state();
	let featureGroup: FeatureGroup | undefined = $state();
	let overlayLayer: Control.Layers | undefined = $state();

	$effect(() => {
		if (reload) {
			reloadLayers();
			reload = false;
		}
	});

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

	// @ts-expect-error - Svelte action can't be async by type definition
	const initMap: MapAction = async (mapContainer, environment) => {
		if (!window.L) {
			await import('leaflet');
			await import('leaflet/dist/leaflet.css');
		}

		featureGroup = new window.L.FeatureGroup();
		overlayLayer = new window.L.Control.Layers();

		const rasterLayer = window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			keepBuffer: 16,
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

			if (environment) {
				map?.addLayer(featureGroup!);
				map?.addControl(overlayLayer!);
				loadFeatures(environment?.getFeatures());
				fitBounds();
			}
		});

		return {
			destroy() {
				map?.remove();
				mapContainer.remove();
			}
		};
	};

	function loadFeatures(features: Feature<G> | Feature<G>[] | FeatureCollection<G>) {
		window.L.geoJSON(features, {
			onEachFeature(feature, layer) {
				addFeatureToMap(feature, layer);
			}
		});
	}

	function addFeatureToMap(feature: Feature, layer: Layer) {
		// @ts-expect-error - This are custom properties
		const { nameID } = feature.properties;

		layer = geoJSONToGeometry(feature as Feature<G>);

		(layer as Path).setStyle(getStylesFromFeature(feature as Feature<G>));

		Object.defineProperty(layer, 'id', { value: feature.id, writable: false });

		const popup = createPopup(feature);

		attachPopupEvents(popup, (popupForm) => {
			updateFeatureProperties(popupForm, featureGroup!);
		});

		layer.bindPopup(popup);

		featureGroup?.addLayer(layer);
		overlayLayer?.addOverlay(layer, nameID || feature.id);
	}

	function clearLayers() {
		featureGroup?.eachLayer((layer) => {
			overlayLayer?.removeLayer(layer);
		});
		featureGroup?.clearLayers();
	}

	function reloadLayers() {
		clearLayers();
		loadFeatures(environment!.getFeatures());
		fitBounds();
	}

	function fitBounds() {
		if (!map || !featureGroup) return;

		const bounds = featureGroup.getBounds();

		if (bounds.isValid()) {
			map.fitBounds(bounds, {
				animate: true,
				padding: [150, 150]
			});
		}
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

<div
	class={cn('grid size-full place-content-center items-center outline-none', className)}
	{...rest}
	use:initMap={environment}
>
	{#if map}
		{#if children}
			{@render children()}
		{/if}
	{:else}
		<LoaderCircle class="size-12 animate-spin" />
	{/if}
</div>

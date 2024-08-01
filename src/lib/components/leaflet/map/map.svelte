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
	import { contextKey } from '$lib/components/leaflet';
	import {
		addPopupToLayer,
		geoJSONToGeometry,
		getStylesFromFeature
	} from '$lib/components/leaflet/helpers';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		zoom?: number;
		center?: [number, number];
		environment?: Environment;
		reload?: boolean;
		isLayerEditable?: boolean;
		floodGeoJSON?: FeatureCollection;
	}

	let {
		children,
		zoom = 15,
		center = [-33.015348, -71.550002],
		environment,
		reload = $bindable(),
		isLayerEditable,
		floodGeoJSON,
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

	$effect(() => {
		if (floodGeoJSON) {
			floodGeoJSON;
			loadFlood(floodGeoJSON);
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
		},
		get isLayerEditable() {
			return isLayerEditable;
		}
	});

	// @ts-expect-error - Svelte action can't be async by type definition
	const initMap: Action<HTMLDivElement, Environment | undefined> = async (
		mapContainer,
		environment
	) => {
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

			map?.addLayer(featureGroup!);

			if (environment) {
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

	// TODO: Set different colors based on depth
	function loadFlood(features: FeatureCollection) {
		featureGroup?.clearLayers();
		window.L.geoJSON(features, {
			onEachFeature(_, layer) {
				// @ts-expect-error - smoothFactor is a valid prop
				(layer as Path).setStyle({ opacity: 0.3, fillOpacity: 0.4, smoothFactor: 0 });
				featureGroup?.addLayer(layer);
			}
		});
	}

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

		if (isLayerEditable) {
			addPopupToLayer(layer, feature, featureGroup!);
		}

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
				padding: [100, 100]
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
	class={cn('isolate grid size-full place-content-center items-center outline-none', className)}
	{...rest}
	use:initMap={environment || undefined}
>
	{#if map}
		{#if children}
			{@render children()}
		{/if}
	{:else}
		<LoaderCircle class="size-12 animate-spin" />
	{/if}
</div>

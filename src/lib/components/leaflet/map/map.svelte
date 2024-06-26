<script context="module" lang="ts">
	export const contextKey = Symbol();
</script>

<script lang="ts">
	import type { G } from '$lib/types';
	import type { Feature } from 'geojson';
	import type { Action } from 'svelte/action';
	import type { Environment } from '$lib/states';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Control, FeatureGroup, Layer, Map, MapOptions, Popup } from 'leaflet';

	import { setContext } from 'svelte';
	import { LoaderCircle } from 'lucide-svelte';
	import { cn, parseGeoJSONProps } from '$lib/utils';
	import { createPopup } from '$lib/components/leaflet';

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

	// @ts-expect-error - Svelte action can't be async, but works anyway
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
				map = undefined;
			}
		};
	};

	// TODO: Lot of cleanup
	// TODO: Export function from other file
	// TODO: Delete duplicated code
	// TODO: Cleaner implementation

	function loadFeatures(features: Feature<G>[]) {
		window.L.geoJSON(features, {
			style: (feature) => {
				return addStyleToFeature(feature!);
			},
			onEachFeature(feature, layer) {
				addFeatureToMap(feature!, layer);
			}
		});
	}

	function addStyleToFeature(feature: Feature) {
		if ('properties' in feature! === false) return {};

		const {
			fill: fillColor,
			stroke: color,
			'stroke-width': weight,
			'fill-opacity': fillOpacity,
			'stroke-opacity': opacity
		} = feature.properties as Record<string, string | number>;

		return {
			smoothFactor: 1.5,
			...(fillColor && { fillColor }),
			...(color && { color }),
			...(!Number.isNaN(Number(weight)) && { weight: Number(weight) }),
			...(!Number.isNaN(Number(fillOpacity)) && { fillOpacity: Number(fillOpacity) }),
			...(!Number.isNaN(Number(opacity)) && { opacity: Number(opacity) })
		};
	}

	function addFeatureToMap(feature: Feature, layer: Layer) {
		// @ts-expect-error - This are custom properties
		const { radius, center, nameID } = feature.properties;

		if (radius && center.length > 0) {
			const coords = new window.L.LatLng(center[0], center[1]);
			layer = new window.L.Circle(coords, radius).setStyle(layer.options);
		}

		Object.defineProperty(layer, 'id', { value: feature.id, writable: false });

		const popup = createPopup(feature);
		attachPopupEvents(popup);

		layer.bindPopup(popup);

		featureGroup?.addLayer(layer);
		overlayLayer?.addOverlay(layer, nameID || feature.id);
	}

	function updateFeatureGroup(id: string) {
		const featureToAdd = environment?.getFeature(id);

		if (!featureToAdd) return;

		// @ts-expect-error - id is a custom property
		const layerToRemove = featureGroup?.getLayers().find((layer) => layer.id === id);

		if (!layerToRemove) return;

		featureGroup?.removeLayer(layerToRemove);
		overlayLayer?.removeLayer(layerToRemove);

		window.L.geoJson(featureToAdd, {
			style: (feature) => {
				return addStyleToFeature(feature!);
			},
			onEachFeature(feature, layer) {
				addFeatureToMap(feature, layer);
			}
		});
	}

	function updateFeatureProperties(target: EventTarget | null) {
		const form = target as HTMLFormElement;
		const formData = new FormData(form);

		const id = formData.get('id') as string;
		let props = parseGeoJSONProps(Object.fromEntries(formData));
		delete props?.id;

		environment?.updateFeatureProperties(id, props);
		updateFeatureGroup(id);
	}

	function attachPopupEvents(popup: Popup) {
		popup.on('add', ({ sourceTarget }) => {
			const form = sourceTarget._container.querySelector('form') as HTMLFormElement;

			form.addEventListener('submit', ({ target }) => {
				updateFeatureProperties(target);
			});
		});

		popup.on('remove', ({ sourceTarget }) => {
			const form = sourceTarget._container.querySelector('form') as HTMLFormElement;

			form.removeEventListener('submit', ({ target }) => {
				updateFeatureProperties(target);
			});
		});
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
		if (!featureGroup) return;

		const bounds = featureGroup.getBounds();

		if (bounds.isValid()) {
			map?.fitBounds(bounds, {
				animate: true,
				padding: [50, 50]
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

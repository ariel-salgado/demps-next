import type { G } from '$lib/types';
import type { Feature, GeoJsonProperties } from 'geojson';
import type { Circle, FeatureGroup, Layer, Path, PathOptions, Polygon, Popup } from 'leaflet';

import { createPopup } from './popup';
import { environment } from '$lib/states';

export function parseGeoJSONStyle(properties: GeoJsonProperties) {
	const toConvert = ['stroke-width', 'fill-opacity', 'stroke-opacity'];

	for (const target of toConvert) {
		if (properties![target] && !Number.isNaN(properties![target])) {
			properties![target] = Number(properties![target]);
		}
	}

	return properties as PathOptions;
}

export function getStylesFromFeature(feature: Feature) {
	if ('properties' in feature === false) return {};

	const {
		fill: fillColor,
		stroke: color,
		'stroke-width': weight,
		'fill-opacity': fillOpacity,
		'stroke-opacity': opacity
	} = parseGeoJSONStyle(feature.properties) as Record<string, string | number>;

	const props = {
		smoothFactor: 1.5,
		...(fillColor && { fillColor }),
		...(color && { color }),
		...(weight && { weight }),
		...(fillOpacity && { fillOpacity }),
		...(opacity && { opacity })
	};

	return props as PathOptions;
}

export function layerToGeometry(layer: Layer) {
	if (layer instanceof window.L.Polygon) {
		const coordinates = layer.getLatLngs();
		return new window.L.Polygon(coordinates);
	} else if (layer instanceof window.L.Circle) {
		const coordinates = layer.getLatLng();
		const radius = Number(layer.getRadius().toFixed(6));
		return new window.L.Circle(coordinates, radius);
	}
	return;
}

export function geometryToGeoJSON<T extends Layer | Polygon | Circle>(feature: T) {
	let featureGeoJSON: Feature<G> | undefined;

	if (feature instanceof window.L.Circle) {
		featureGeoJSON = window.L.PM.Utils.circleToPolygon(feature, 18).toGeoJSON(6);

		featureGeoJSON.properties!.radius = Number(feature.getRadius().toFixed(6));
		featureGeoJSON.properties!.center = [
			Number(feature.getLatLng().lat.toFixed(6)),
			Number(feature.getLatLng().lng.toFixed(6))
		];
	} else if (feature instanceof window.L.Polygon) {
		featureGeoJSON = feature.toGeoJSON(6);
	} else {
		return;
	}

	// @ts-expect-error - id is added property
	return { id: feature.id, ...featureGeoJSON };
}

export function geoJSONToGeometry(feature: Feature<G>) {
	//@ts-expect-error - radius and center are added properties
	const { radius, center } = feature.properties;

	if (radius && center.length > 0) {
		const coordinates = new window.L.LatLng(center[0], center[1]);
		return new window.L.Circle(coordinates, radius);
	} else {
		const coordinates = window.L.GeoJSON.coordsToLatLngs(feature.geometry.coordinates.flat());
		return new window.L.Polygon(coordinates);
	}
}

export function attachPopupEvents(popup: Popup, onSubmit: (form: HTMLFormElement) => void) {
	popup.on('add', ({ sourceTarget }) => {
		const form = sourceTarget._container.querySelector('form') as HTMLFormElement;

		form.addEventListener('submit', ({ target }) => {
			onSubmit(target as HTMLFormElement);
			popup.close();
		});
	});

	popup.on('remove', ({ sourceTarget }) => {
		const form = sourceTarget._container.querySelector('form') as HTMLFormElement;

		form.removeEventListener('submit', ({ target }) => {
			onSubmit(target as HTMLFormElement);
		});
	});
}

export function updateFeatureProperties(form: HTMLFormElement, featureGroup: FeatureGroup) {
	const formData = new FormData(form);

	const { id, ...props } = parseGeoJSONStyle(Object.fromEntries(formData)) as Record<
		string,
		string
	>;

	environment?.updateFeatureProperties(id, props);
	updateLayerStyle(id, featureGroup);

	return environment.getFeature(id);
}

function updateLayerStyle(id: string, featureGroup: FeatureGroup) {
	const feature = environment?.getFeature(id);

	if (!feature) return;

	// @ts-expect-error - id is added property
	const layer = featureGroup?.getLayers().find((layer) => layer.id === id) as Path;

	if (!layer) return;

	layer.setStyle(getStylesFromFeature(feature));
	layer.redraw();
}

export function addPopupToLayer(layer: Layer, feature: Feature, featureGroup: FeatureGroup) {
	const popup = createPopup(feature);

	attachPopupEvents(popup, (popupForm) => {
		const updatedFeature = updateFeatureProperties(popupForm, featureGroup!);
		layer.unbindPopup();

		addPopupToLayer(layer, updatedFeature!, featureGroup);
	});

	layer.bindPopup(popup);
}

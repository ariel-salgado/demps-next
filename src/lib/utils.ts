import type { ZodType } from 'zod';
import type { ClassValue } from 'clsx';
import type { Action } from 'svelte/action';
import type { Feature, FeatureCollection } from 'geojson';
import type { FormField, FormSchema, G, ParametersSchema, SelectOptions } from '$lib/types';

// Others
import { z } from 'zod';
import { clsx } from 'clsx';
import { on } from 'svelte/events';
import { twMerge } from 'tailwind-merge';
import { browser } from '$app/environment';

// GeoJSON related
import { rewind } from '@turf/rewind';
import { truncate } from '@turf/truncate';
import { randomPolygon } from '@turf/random';
import { HintError, check } from '@placemarkio/check-geojson';

export function saveLocalStorage(key: string, value: any) {
	if (browser) {
		localStorage.setItem(key, JSON.stringify(value));
	}
}

export function loadLocalStorage<T>(key: string) {
	const stored = browser ? localStorage.getItem(key) : null;
	try {
		return stored ? (JSON.parse(stored) as T) : null;
	} catch {
		return null;
	}
}

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function randomID(): string {
	return crypto.randomUUID().split('-').at(-1) as string;
}

export function generatePolygon(): Feature<G> {
	const id = randomID();
	const feature = (rewind(randomPolygon()) as FeatureCollection<G>).features.at(0)!;

	return { id, ...feature };
}

export function strEqualsObj(str: string, obj: object) {
	try {
		return JSON.stringify(JSON.parse(str)) === JSON.stringify(obj);
	} catch {
		return false;
	}
}

export function isValidGeoJSON(json: string | object) {
	try {
		if (typeof json === 'object') {
			json = JSON.stringify(json);
		}

		check(json);
		return true;
	} catch (e) {
		if (e instanceof HintError || e instanceof Error) {
			console.error(e.message);
			return false;
		}
		throw e;
	}
}

export function preprocessGeoJSON(geojson: FeatureCollection | string) {
	try {
		if (typeof geojson === 'string') {
			geojson = JSON.parse(geojson) as FeatureCollection;
		}

		if (!isValidGeoJSON(geojson)) {
			return;
		}

		const features: Feature<G>[] = [];

		for (const feature of geojson.features) {
			const id = feature.id ? String(feature.id) : randomID();
			const truncated = truncate(feature, { precision: 6, coordinates: 2, mutate: true });
			const rewinded = rewind(truncated, { mutate: true }) as Feature<G>;

			features.push({ id, ...rewinded });
		}

		return { type: 'FeatureCollection', features } as FeatureCollection<G>;
	} catch {
		throw new Error('Invalid GeoJSON');
	}
}

export function debounce<T extends (...args: Parameters<T>) => void>(
	this: ThisParameterType<T>,
	fn: T,
	delay: number
) {
	let timer: ReturnType<typeof setTimeout> | undefined;
	return (...args: Parameters<T>) => {
		clearTimeout(timer);
		timer = setTimeout(() => fn.apply(this, args), delay);
	};
}

export function splitCamelCase(word: string) {
	return word.replace(/([a-z])([A-Z])/g, '$1 $2');
}

export function flattenJSON(obj: object, prefix: string = '') {
	const flatObj: Record<string, unknown> = {};

	for (const key of Object.keys(obj)) {
		const value: Array<unknown> = obj[key as keyof typeof obj];
		const fullKey = prefix ? `${prefix}.${key}` : key;

		if (value && typeof value === 'object') {
			if (Array.isArray(value)) {
				value.forEach((item, index) => {
					if (typeof item === 'object') {
						Object.assign(flatObj, flattenJSON(item!, `${fullKey}.${index}`));
					} else {
						flatObj[`${fullKey}.${index}`] = item;
					}
				});
			} else {
				Object.assign(flatObj, flattenJSON(value, fullKey));
			}
		} else {
			flatObj[fullKey] = value;
		}
	}

	return flatObj;
}

export function deflattenJSON(obj: object) {
	return Object.keys(obj).reduce(
		(deflatObj, key) => {
			const keys = key.split('.');
			let currentObj = deflatObj;
			for (let i = 0; i < keys.length - 1; i++) {
				const currentKey = keys[i] as string;
				currentObj[currentKey] = currentObj?.[currentKey] || (/^\d+$/.test(keys[i + 1]!) ? [] : {});
				currentObj = currentObj[currentKey] as Record<string, unknown>;
			}
			currentObj[keys.at(-1)!] = obj[key as keyof typeof obj];
			return deflatObj;
		},
		{} as Record<string, unknown>
	);
}

export function arrayToSelectOptions(array: string[]): SelectOptions {
	return array.map((value) => ({ value: value, label: value }));
}

export function getPathUpTo(fullPath: string, dir: string) {
	const segments = fullPath.split('/');
	const targetIndex = segments.indexOf(dir);

	if (targetIndex === -1) {
		return null;
	}

	const path = segments.slice(0, targetIndex + 1).join('/');

	return path + (path.endsWith('/') ? '' : '/');
}

export function joinPath(path1: string, path2: string) {
	const segments1 = path1.split('/').filter(Boolean);
	const segments2 = path2.split('/').filter(Boolean);

	for (const segment of segments2) {
		if (segment === '..') {
			if (segments1.length > 0) {
				segments1.pop();
			}
		} else if (segment !== '.') {
			segments1.push(segment);
		}
	}

	const path = '/' + segments1.join('/');

	// TODO: Check for folders, as folders can have dots too
	if (!path.split('/').at(-1)?.includes('.')) {
		return path + (path.endsWith('/') ? '' : '/');
	}

	return path;
}

export const clickOutside: Action<HTMLElement, () => void> = (node, callback) => {
	const onClick = on(node.parentElement as HTMLElement, 'click', ({ target }) => {
		if (!node.contains(target as Node)) {
			callback();
		}
	});

	return {
		destroy() {
			onClick();
		}
	};
};

export function extractDefaultValues(schema: FormSchema): Record<string, any> {
	const defaultValues: Record<string, any> = {};

	function processField(field: FormField) {
		const name = field.attributes.name;

		if (!name) return;

		if (
			(field.type === 'input' || field.type === 'explorer') &&
			field.attributes.value !== undefined
		) {
			defaultValues[name] = field.attributes.value;
		} else if (field.type === 'select') {
			const selectedOption = field.options.find((option) => option.selected);
			if (selectedOption) {
				defaultValues[name] = selectedOption.value;
			}
		}
	}

	function processFields(fields: FormField[] | Record<string, FormField[]>) {
		if (Array.isArray(fields)) {
			fields.forEach((field) => processField(field));
		} else {
			Object.values(fields)
				.flat()
				.forEach((field) => processField(field));
		}
	}

	Object.values(schema).forEach((fields) => processFields(fields));

	return defaultValues;
}

export const nonEmpty = (message?: string) =>
	z.any().refine((val) => val !== undefined && val !== null && val !== '', {
		message: message ?? 'El campo es requerido.'
	});

export function preprocessParametersData(parameters: ParametersSchema) {
	// Set default values if they doesnt exist
	parameters.input.directory ??= 'input/';
	parameters.output.directory ??= 'output/';
	parameters.input.zones ??= 'zones.geojson';

	// Add prefixes to input and output directories
	if (parameters.input.directory.split('/').at(0) !== 'input') {
		parameters.input.directory = joinPath('input/', parameters.input.directory || '');
	}

	if (parameters.output.directory.split('/').at(0) !== 'output') {
		parameters.output.directory = joinPath('output/', parameters.output.directory || '');
	}

	// Add .geojson extension to zones field if it doesn't have it
	parameters.input.zones = parameters.input.zones.endsWith('.geojson')
		? parameters.input.zones
		: `${parameters.input.zones}.geojson`;

	return parameters;
}

export function stringifyZodFieldErrors(fieldErrors: { [x: string]: string[] | undefined }) {
	const entries = Object.entries(fieldErrors);

	if (entries.length === 0) return '';

	const [key, value] = entries[0];
	const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
	const message = value?.[0] ?? 'Error desconocido';

	return `${capitalizedKey}: ${message}`;
}

export function getValidationSchema(form: FormSchema) {
	const validations: Record<string, ZodType> = {};
	const stack = Object.entries(form);

	while (stack.length) {
		// @ts-expect-error - stack has an iterator.
		const [key, value] = stack.pop();

		if (Array.isArray(value)) {
			for (const item of value) {
				if (
					typeof item === 'object' &&
					item !== null &&
					'validation' in item &&
					'attributes' in item
				) {
					const {
						validation,
						attributes: { name }
					} = item;
					if (name) {
						validations[name] = validation;
					}
				} else {
					// @ts-expect-error - The value is too complex to be typed.
					stack.push(...Object.entries(item).map(([k, v]) => [`${key}.${k}`, v]));
				}
			}
		} else if (typeof value === 'object' && value !== null) {
			// @ts-expect-error - The value is too complex to be typed.
			stack.push(...Object.entries(value).map(([k, v]) => [`${key}.${k}`, v]));
		}
	}

	const schema = z.object(validations);

	return schema;
}

export function getRelativePath(path: string, subPath: string) {
	const pathParts = path.split('/').filter(Boolean);
	const subPathParts = subPath.split('/').filter(Boolean);

	return subPathParts.filter((folder) => !pathParts.includes(folder)).join('/');
}

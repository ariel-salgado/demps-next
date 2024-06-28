import type { Feature, GeoJsonProperties } from 'geojson';
import type { HTMLInputAttributes, HTMLSelectAttributes } from 'svelte/elements';

import { popupFields } from '$lib/config';

function spreadAttributes(attributes: HTMLInputAttributes | HTMLSelectAttributes) {
	let props: string = '';
	for (const [key, value] of Object.entries(attributes)) {
		props += key + '="' + value + '" ';
	}
	return props;
}

function createFormFields(fields: GeoJsonProperties) {
	let data: string = '';

	for (const [key, value] of Object.entries(popupFields)) {
		data += `
            <div>
                <label class="block min-w-max font-semibold text-slate-500 text-sm leading-relaxed pl-1" for="${key}">${key}</label>
                ${
									value.type === 'select'
										? `<select class="h-9 w-full py-1.5 px-3 rounded-md border border-slate-300 text-sm" id="${key}" name="${key}" ${spreadAttributes(value.attributes)}>
						<option value="" disabled selected>Seleccione ${key}</option>
						${value.options
							.map(
								(option) =>
									`<option value="${option}" ${option === fields![key] && `selected`}>${option}</option>`
							)
							.join('')}
					</select>`
										: `<input class="h-9 w-full py-1.5 px-3 rounded-md border border-slate-300 text-sm ${value.type === `text` && `read-only:cursor-not-allowed`} read-only:select-none read-only:bg-slate-100 read-only:text-neutral-600" type="${value.type}" id="${key}" name="${key}" value="${fields![key] || value.defaultValue}" ${spreadAttributes(value.attributes)} placeholder="Ingrese ${key}" />`
								}
            </div>`;
	}

	return data;
}

function createForm(fields: GeoJsonProperties) {
	const formFields = createFormFields(fields);

	return `
		<div class="py-2 w-[24rem] cursor-auto">
			<span class="w-full text-xl font-semibold block">Editar propiedades</span>
			<span class="block h-px w-full bg-neutral-300 mt-2"></span>
			<form>
				<div class="grid grid-cols-2 py-4 gap-4 items-center place-content-center">
					${formFields}
				</div>
				<span class="block h-px w-full bg-neutral-300 mt-2 mb-4"></span>
				<button type="submit" class="flex h-9 w-full cursor-pointer items-center justify-center gap-x-1 whitespace-nowrap rounded-lg bg-slate-700 px-4 py-2 font-medium text-white ring-offset-white transition-colors focus-within:bg-slate-700/85 focus-within:outline-none focus-within:ring-2 focus-within:ring-slate-700 focus-within:ring-offset-2 hover:bg-slate-700/85 text-base">Guardar cambios</button>
			</form>
		</div>
	`;
}

export function createPopup(feature: Feature) {
	const { id, properties } = feature;

	const content = createForm({ id, ...properties });
	const popup = window.L.popup({ content: content, interactive: true, maxWidth: 500 });

	return popup;
}

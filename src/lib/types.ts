import type { ZodType } from 'zod';
import type { Geometry, GeometryCollection } from 'geojson';
import type { HTMLInputAttributes, HTMLSelectAttributes } from 'svelte/elements';

export type G = Exclude<Geometry, GeometryCollection>;

export type SelectOptions = {
	label: string | null;
	value: string | number | boolean;
	selected?: boolean | undefined;
}[];

export type InputOrSelectProps =
	| { type: 'input'; attributes: HTMLInputAttributes & { type: 'text' | 'number' } }
	| { type: 'select'; attributes: HTMLSelectAttributes; options: SelectOptions };

export type FormField = {
	label: string;
	description?: string;
	validation?: ZodType;
} & InputOrSelectProps;

export type FormSchema = Record<string, FormField[] | Record<string, FormField[]>>;

import type { Geometry, GeometryCollection } from 'geojson';

export type G = Exclude<Geometry, GeometryCollection>;

export type SelectOptions = {
	label: string | null;
	value: string | number | boolean;
	selected?: boolean | undefined;
}[];

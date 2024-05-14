import type { Geometry, GeometryCollection } from 'geojson';

export type G = Exclude<Geometry, GeometryCollection>;

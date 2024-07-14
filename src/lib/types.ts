import type { ZodType } from 'zod';
import type { Geometry, GeometryCollection } from 'geojson';
import type {
	HTMLInputAttributes,
	HTMLInputTypeAttribute,
	HTMLSelectAttributes
} from 'svelte/elements';

export type FetchDirectoryOptions = Partial<{
	extensions: string[] | null;
	includeFiles: boolean;
	includeFolders: boolean;
}>;

export type G = Exclude<Geometry, GeometryCollection>;

export type SelectOptions = {
	label: string | null;
	value: string | number | boolean | null;
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

export type InputPopupField = {
	type: HTMLInputTypeAttribute;
	defaultValue: string | number | boolean;
	attributes: HTMLInputAttributes;
};

export type SelectPopupField = {
	type: 'select';
	defaultValue: string | number;
	attributes: HTMLSelectAttributes;
	options: string[];
};

export type PopupFields = Record<string, InputPopupField | SelectPopupField>;

export type ParametersSchema = {
	duration: number;
	calibration: number;
	quadSize: number;
	closeEnough: number; //float
	randomWalkwayRadius: number; //float
	attractionRadius: number; //float
	deltaT: number; //float
	threads: number;
	floodModelEnable: boolean;
	densityModelEnable: boolean;
	panicModelEnable: boolean;
	elevationModelEnable: boolean;
	debrisModelEnable: boolean;
	city: string;
	description: string;
	samplingInterval: number;
	baseDirSim: string;
	input: {
		directory: string;
		map: string;
		zones: string;
	};
	output: {
		progressBar: boolean;
		interval: number;
		directory: string;
		'agents-out': boolean;
		'agents-path': string;
		'agents-precision': number;
		'agents-sufix': string;
		'stats-out': boolean;
		'stats-interval': number;
		'stats-path': string;
		'anim-config': string;
		'heatMap-out': boolean;
		'heatMap-size': number;
		'heatMap-interval': number;
		'heatMap-path': string;
	};
	floodParams: {
		direction: string; //N->S;W->E
		sampleStateInterval: number;
		arrivalTime: number; //negative
		speedWaterProp: number; //float
		speedWaterLevel: number; //float
		criticalLevel: number; //float
		minSpeedFactor: number; //float
		imagesEnable: boolean;
		imagesDir: string;
		stateEnable: boolean;
		stateDir: string;
	};
	densityParams: {
		minDensity: number; //float
		maxDensity: number; //float
		minVelocity: number; //float
	};
	agents: Agent[];
};

type Agent = {
	model: 'Residents' | 'Visitors';
	number: number;
	responseTime: {
		tau: number;
		sigma: number;
	};
	phoneUse: {
		meanTimeTakePhone: number; //float
		probPhoneUseConst: number;
	};
	ageRange: {
		G0: {
			prob: number; //float
			minSpeed: number; //float
			maxSpeed: number; //float
		};
		G1: {
			prob: number; //float
			minSpeed: number; //float
			maxSpeed: number; //float
		};
		G2: {
			prob: number; //float
			minSpeed: number; //float
			maxSpeed: number; //float
		};
		G3: {
			prob: number; //float
			minSpeed: number; //float
			maxSpeed: number; //float
		};
	};
	SFM: {
		timeRelax: number; //float
		sigma: number; //float
		repulsiveForceAgents: number; //float
		cosphi: number; //negative float
	};
	panicModel: {
		emotionThreshold: number; //float
		probInfectedToRecovered: number; //float
		probRecoveredToSusceptible: number; //float
		meanTimeInInfected: number;
		sdTimeInInfected: number; //float
		meanTimeInRecovered: number;
		sdTimeInRecovered: number; //float
	};
};

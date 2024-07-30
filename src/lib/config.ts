import type { FormSchema, PopupFields } from './types';

import { joinPath, nonEmpty } from './utils';
import { PUBLIC_BASE_DIR, PUBLIC_SIM_DIR } from '$env/static/public';

export const popupFields = {
	id: {
		type: 'text',
		defaultValue: '',
		attributes: {
			readonly: true
		}
	},
	nameID: {
		type: 'text',
		defaultValue: '',
		attributes: {}
	},
	zoneType: {
		type: 'select',
		defaultValue: '',
		attributes: {},
		options: ['initial', 'flood', 'safe']
	},
	stroke: {
		type: 'color',
		defaultValue: '#3388ff',
		attributes: {}
	},
	'stroke-width': {
		type: 'number',
		defaultValue: 3,
		attributes: {
			min: 0,
			step: 1
		}
	},
	'stroke-opacity': {
		type: 'number',
		defaultValue: 1,
		attributes: {
			min: 0,
			max: 1,
			step: 0.1
		}
	},
	fill: {
		type: 'color',
		defaultValue: '#3388ff',
		attributes: {}
	},
	'fill-opacity': {
		type: 'number',
		defaultValue: 0.2,
		attributes: {
			min: 0,
			max: 1,
			step: 0.1
		}
	}
} satisfies PopupFields;

export const parametersFormFields = {
	general: [
		{
			label: 'Duration',
			description: 'Duración de la simulación',
			type: 'input',
			attributes: {
				name: 'duration',
				type: 'number',
				value: 3600,
				placeholder: 'Ingrese la duración de la simulación'
			},
			validation: nonEmpty()
		},
		{
			label: 'Calibration',
			description: 'Calibración de la simulación',
			type: 'input',
			attributes: {
				name: 'calibration',
				type: 'number',
				value: 50,
				placeholder: 'Ingrese la calibración de la simulación'
			},
			validation: nonEmpty()
		},
		{
			label: 'Quad Size',
			description: 'Tamaño de los cuadrantes',
			type: 'input',
			attributes: {
				name: 'quadSize',
				type: 'number',
				value: 10,
				placeholder: 'Ingrese el tamaño de los cuadrantes'
			},
			validation: nonEmpty()
		},
		{
			label: 'Close Enough',
			description: 'Distancia de cercanía',
			type: 'input',
			attributes: {
				name: 'closeEnough',
				type: 'number',
				value: 50,
				placeholder: 'Ingrese la distancia de cercanía'
			},
			validation: nonEmpty()
		},
		{
			label: 'Random Walkway Radius',
			description: 'Radio de la caminata aleatoria',
			type: 'input',
			attributes: {
				name: 'randomWalkwayRadius',
				type: 'number',
				value: 100,
				placeholder: 'Ingrese el radio de la caminata aleatoria'
			},
			validation: nonEmpty()
		},
		{
			label: 'Attraction Radius',
			description: 'Radio de atracción',
			type: 'input',
			attributes: {
				name: 'attractionRadius',
				type: 'number',
				value: 5,
				placeholder: 'Ingrese el radio de atracción'
			},
			validation: nonEmpty()
		},
		{
			label: 'Delta T',
			description: 'Delta T',
			type: 'input',
			attributes: {
				name: 'deltaT',
				type: 'number',
				value: 1.0,
				placeholder: 'Ingrese el delta T'
			},
			validation: nonEmpty()
		},
		{
			label: 'Threads',
			description: 'Cantidad de hilos',
			type: 'input',
			attributes: {
				name: 'threads',
				type: 'number',
				value: 4,
				placeholder: 'Ingrese la cantidad de hilos'
			},
			validation: nonEmpty()
		},
		{
			label: 'Flood Model Enable',
			description: 'Modelo de inundación',
			type: 'select',
			options: [
				{
					value: true,
					label: 'Habilitado'
				},
				{
					value: false,
					label: 'Deshabilitado',
					selected: true
				}
			],
			attributes: {
				name: 'floodModelEnable'
			},
			validation: nonEmpty()
		},
		{
			label: 'Density Model Enable',
			description: 'Modelo de densidad',
			type: 'select',
			options: [
				{
					value: true,
					label: 'Habilitado'
				},
				{
					value: false,
					label: 'Deshabilitado',
					selected: true
				}
			],
			attributes: {
				name: 'densityModelEnable'
			},
			validation: nonEmpty()
		},
		{
			label: 'Panic Model Enable',
			description: 'Modelo de pánico',
			type: 'select',
			options: [
				{
					value: true,
					label: 'Habilitado'
				},
				{
					value: false,
					label: 'Deshabilitado',
					selected: true
				}
			],
			attributes: {
				name: 'panicModelEnable'
			},
			validation: nonEmpty()
		},
		{
			label: 'Elevation Model Enable',
			description: 'Modelo de elevación',
			type: 'select',
			options: [
				{
					value: true,
					label: 'Habilitado'
				},
				{
					value: false,
					label: 'Deshabilitado',
					selected: true
				}
			],
			attributes: {
				name: 'elevationModelEnable'
			},
			validation: nonEmpty()
		},
		{
			label: 'Debris Model Enable',
			description: 'Modelo de escombros',
			type: 'select',
			options: [
				{
					value: true,
					label: 'Habilitado'
				},
				{
					value: false,
					label: 'Deshabilitado',
					selected: true
				}
			],
			attributes: {
				name: 'debrisModelEnable'
			},
			validation: nonEmpty()
		},
		{
			label: 'City',
			description: 'Ciudad',
			type: 'input',
			attributes: {
				name: 'city',
				type: 'text',
				placeholder: 'Ingrese la ciudad'
			},
			validation: nonEmpty()
		},
		{
			label: 'Description',
			description: 'Descripción',
			type: 'input',
			attributes: {
				name: 'description',
				type: 'text',
				placeholder: 'Ingrese la descripción'
			}
		},
		{
			label: 'Sampling Interval',
			description: 'Intervalo de muestreo',
			type: 'input',
			attributes: {
				name: 'samplingInterval',
				type: 'number',
				value: 100,
				placeholder: 'Ingrese el intervalo de muestreo'
			},
			validation: nonEmpty()
		}
	],
	input: [
		{
			label: 'Map',
			description: 'Mapa',
			type: 'explorer',
			attributes: {
				name: 'input.map',
				placeholder: 'Ingrese ruta absoluta del archivo .osrm.'
			},
			props: {
				isFile: true,
				includeFolders: false,
				extensions: ['.osrm'],
				initialPath: joinPath(PUBLIC_BASE_DIR, 'planet.openstreetmap.org/chile/')
			},
			validation: nonEmpty()
		},
		{
			label: 'Zones',
			description: 'Zonas',
			type: 'explorer',
			attributes: {
				type: 'text',
				name: 'input.zones',
				placeholder: 'Ingrese nombre del archivo de zonas.'
			},
			props: {
				isFile: true,
				includeFolders: false,
				extensions: ['.geojson'],
				initialPath: PUBLIC_SIM_DIR
			},
			validation: nonEmpty()
		}
	],
	output: [
		{
			label: 'Progress Bar',
			description: 'Barra de progreso',
			type: 'select',
			options: [
				{
					value: true,
					label: 'Habilitado',
					selected: true
				},
				{
					value: false,
					label: 'Deshabilitado'
				}
			],
			attributes: {
				name: 'output.progressBar'
			},
			validation: nonEmpty()
		},
		{
			label: 'Interval',
			description: 'Intervalo',
			type: 'input',
			attributes: {
				name: 'output.interval',
				type: 'number',
				value: 10,
				placeholder: 'Ingrese el intervalo'
			},
			validation: nonEmpty()
		},
		{
			label: 'Directory',
			description: 'Directorio',
			type: 'explorer',
			attributes: {
				name: 'output.directory',
				value: joinPath(PUBLIC_SIM_DIR, 'output/')
			},
			props: {
				isFile: false,
				includeFiles: false
			},
			validation: nonEmpty()
		},
		{
			label: 'Agents Out',
			description: 'Salida de agentes',
			type: 'select',
			options: [
				{
					value: true,
					label: 'Habilitado',
					selected: true
				},
				{
					value: false,
					label: 'Deshabilitado'
				}
			],
			attributes: {
				name: 'output.agents-out'
			},
			validation: nonEmpty()
		},
		{
			label: 'Agents Path',
			description: 'Directorio de agentes',
			type: 'input',
			attributes: {
				type: 'text',
				name: 'output.agents-path',
				value: 'agents/',
				placeholder: 'Ingrese directorio de salida de los agentes.',
				readonly: true
			},
			validation: nonEmpty()
		},
		{
			label: 'Agents Precision',
			description: 'Precisión de agentes',
			type: 'input',
			attributes: {
				name: 'output.agents-precision',
				type: 'number',
				value: 8,
				placeholder: 'Ingrese la precisión de agentes'
			},
			validation: nonEmpty()
		},
		{
			label: 'Agents Sufix',
			description: 'Sufijo de agentes',
			type: 'input',
			attributes: {
				name: 'output.agents-sufix',
				type: 'text',
				value: 'txt',
				placeholder: 'Ingrese el sufijo de agentes'
			},
			validation: nonEmpty()
		},
		{
			label: 'Stats Out',
			description: 'Salida de estadísticas',
			type: 'select',
			options: [
				{
					value: true,
					label: 'Habilitado',
					selected: true
				},
				{
					value: false,
					label: 'Deshabilitado'
				}
			],
			attributes: {
				name: 'output.stats-out'
			},
			validation: nonEmpty()
		},
		{
			label: 'Stats Interval',
			description: 'Intervalo de estadísticas',
			type: 'input',
			attributes: {
				name: 'output.stats-interval',
				type: 'number',
				placeholder: 'Ingrese el intervalo de estadísticas',
				value: 10
			},
			validation: nonEmpty()
		},
		{
			label: 'Stats Path',
			description: 'Directorio de estadísticas',
			type: 'input',
			attributes: {
				type: 'text',
				name: 'output.stats-path',
				value: 'stats/',
				placeholder: 'Ingrese directorio de salida de estadísticas.',
				readonly: true
			},
			validation: nonEmpty()
		},
		{
			label: 'Anim Config',
			description: 'Nombre de archivo de configuración de animación',
			type: 'input',
			attributes: {
				type: 'text',
				name: 'output.anim-config',
				value: 'animacion.config.json',
				placeholder: 'Ingrese nombre de archivo de animación.'
			},
			validation: nonEmpty()
		},
		{
			label: 'Heat Map Out',
			description: 'Salida de mapa de calor',
			type: 'select',
			options: [
				{
					value: true,
					label: 'Habilitado'
				},
				{
					value: false,
					label: 'Deshabilitado',
					selected: true
				}
			],
			attributes: {
				name: 'output.heatMap-out'
			},
			validation: nonEmpty()
		},
		{
			label: 'Heat Map Size',
			description: 'Tamaño del mapa de calor',
			type: 'input',
			attributes: {
				name: 'output.heatMap-size',
				type: 'number',
				value: 2,
				placeholder: 'Ingrese el tamaño del mapa de calor'
			},
			validation: nonEmpty()
		},
		{
			label: 'Heat Map Interval',
			description: 'Intervalo del mapa de calor',
			type: 'input',
			attributes: {
				name: 'output.heatMap-interval',
				type: 'number',
				value: 120,
				placeholder: 'Ingrese el intervalo del mapa de calor'
			},
			validation: nonEmpty()
		},
		{
			label: 'Heat Map Path',
			description: 'Directorio del mapa de calor',
			type: 'input',
			attributes: {
				type: 'text',
				name: 'output.heatMap-path',
				value: 'heatMaps/',
				placeholder: 'Ingrese directorio de salida del mapa de calor.',
				readonly: true
			},
			validation: nonEmpty()
		}
	],
	floodParams: [
		{
			label: 'Direction',
			description: 'Dirección',
			type: 'input',
			attributes: {
				name: 'floodParams.direction',
				type: 'text',
				value: 'N->S;W->E',
				placeholder: 'Ingrese la dirección'
			},
			validation: nonEmpty()
		},
		{
			label: 'Sample State Interval',
			description: 'Intervalo de muestreo de estado',
			type: 'input',
			attributes: {
				name: 'floodParams.sampleStateInterval',
				type: 'number',
				value: 10,
				placeholder: 'Ingrese el intervalo de muestreo de estado'
			},
			validation: nonEmpty()
		},
		{
			label: 'Arrival Time',
			description: 'Tiempo de llegada',
			type: 'input',
			attributes: {
				name: 'floodParams.arrivalTime',
				type: 'number',
				value: -1550,
				placeholder: 'Ingrese el tiempo de llegada'
			},
			validation: nonEmpty()
		},
		{
			label: 'Speed Water Prop',
			description: 'Velocidad del agua proporcional',
			type: 'input',
			attributes: {
				name: 'floodParams.speedWaterProp',
				type: 'number',
				value: 0.75,
				placeholder: 'Ingrese la velocidad del agua proporcional'
			},
			validation: nonEmpty()
		},
		{
			label: 'Speed Water Level',
			description: 'Velocidad del agua nivel',
			type: 'input',
			attributes: {
				name: 'floodParams.speedWaterLevel',
				type: 'number',
				value: 0.000165,
				placeholder: 'Ingrese la velocidad del agua nivel'
			},
			validation: nonEmpty()
		},
		{
			label: 'Critical Level',
			description: 'Nivel crítico',
			type: 'input',
			attributes: {
				name: 'floodParams.criticalLevel',
				type: 'number',
				value: 0.1,
				placeholder: 'Ingrese el nivel crítico'
			},
			validation: nonEmpty()
		},
		{
			label: 'Min Speed Factor',
			description: 'Factor de velocidad mínimo',
			type: 'input',
			attributes: {
				name: 'floodParams.minSpeedFactor',
				type: 'number',
				value: 0.1,
				placeholder: 'Ingrese el factor de velocidad mínimo'
			},
			validation: nonEmpty()
		},
		{
			label: 'Images Enable',
			description: 'Habilitación de imágenes',
			type: 'select',
			options: [
				{
					value: true,
					label: 'Habilitado'
				},
				{
					value: false,
					label: 'Deshabilitado',
					selected: true
				}
			],
			attributes: {
				name: 'floodParams.imagesEnable'
			},
			validation: nonEmpty()
		},
		{
			label: 'Images Dir',
			description: 'Directorio de imágenes',
			type: 'input',
			attributes: {
				type: 'text',
				name: 'floodParams.imagesDir',
				value: 'floodImgs/',
				placeholder: 'Ingrese directorio de salida de las imágenes.',
				readonly: true
			},
			validation: nonEmpty()
		},
		{
			label: 'State Enable',
			description: 'Habilitación de estado',
			type: 'select',
			options: [
				{
					value: true,
					label: 'Habilitado',
					selected: true
				},
				{
					value: false,
					label: 'Deshabilitado'
				}
			],
			attributes: {
				name: 'floodParams.stateEnable'
			},
			validation: nonEmpty()
		},
		{
			label: 'State Dir',
			description: 'Directorio de estado',
			type: 'input',
			attributes: {
				type: 'text',
				name: 'floodParams.stateDir',
				value: 'floodState/',
				placeholder: 'Ingrese directorio de salida de estado de inundación.',
				readonly: true
			},
			validation: nonEmpty()
		}
	],
	densityParams: [
		{
			label: 'Min Density',
			description: 'Densidad mínima',
			type: 'input',
			attributes: {
				name: 'densityParams.minDensity',
				type: 'number',
				value: 0.3,
				placeholder: 'Ingrese la densidad mínima'
			},
			validation: nonEmpty()
		},
		{
			label: 'Max Density',
			description: 'Densidad máxima',
			type: 'input',
			attributes: {
				name: 'densityParams.maxDensity',
				type: 'number',
				value: 6.0,
				placeholder: 'Ingrese la densidad máxima'
			},
			validation: nonEmpty()
		},
		{
			label: 'Min Velocity',
			description: 'Velocidad mínima',
			type: 'input',
			attributes: {
				name: 'densityParams.minVelocity',
				type: 'number',
				value: 0.2,
				placeholder: 'Ingrese la velocidad mínima'
			},
			validation: nonEmpty()
		}
	],
	agents: {
		residents: [
			{
				label: 'Model',
				description: 'Modelo',
				type: 'input',
				attributes: {
					name: 'agents.0.model',
					type: 'text',
					placeholder: 'Ingrese el modelo',
					value: 'Residents',
					readonly: true
				}
			},
			{
				label: 'Number',
				description: 'Número',
				type: 'input',
				attributes: {
					name: 'agents.0.number',
					type: 'number',
					value: 41686,
					placeholder: 'Ingrese el número'
				}
			},
			{
				label: 'Tau',
				description: 'Tau',
				type: 'input',
				attributes: {
					name: 'agents.0.responseTime.tau',
					type: 'number',
					value: 0,
					placeholder: 'Ingrese el tau'
				}
			},
			{
				label: 'Sigma',
				description: 'Sigma',
				type: 'input',
				attributes: {
					name: 'agents.0.responseTime.sigma',
					type: 'number',
					value: 144,
					placeholder: 'Ingrese el sigma'
				}
			},
			{
				label: 'Mean Time Take Phone',
				description: 'Tiempo medio de toma de teléfono',
				type: 'input',
				attributes: {
					name: 'agents.0.phoneUse.meanTimeTakePhone',
					type: 'number',
					value: 20.0,
					placeholder: 'Ingrese el tiempo medio de toma de teléfono'
				}
			},
			{
				label: 'Prob Phone Use Const',
				description: 'Probabilidad de uso de teléfono constante',
				type: 'input',
				attributes: {
					name: 'agents.0.phoneUse.probPhoneUseConst',
					type: 'number',
					value: 10,
					placeholder: 'Ingrese la probabilidad de uso de teléfono constante'
				}
			},
			{
				label: 'G0 Prob',
				description: 'Probabilidad G0',
				type: 'input',
				attributes: {
					name: 'agents.0.ageRange.G0.prob',
					type: 'number',
					value: 0.1651,
					placeholder: 'Ingrese la probabilidad G0'
				}
			},
			{
				label: 'G0 Min Speed',
				description: 'Velocidad mínima G0',
				type: 'input',
				attributes: {
					name: 'agents.0.ageRange.G0.minSpeed',
					type: 'number',
					value: 1.14,
					placeholder: 'Ingrese la velocidad mínima G0'
				}
			},
			{
				label: 'G0 Max Speed',
				description: 'Velocidad máxima G0',
				type: 'input',
				attributes: {
					name: 'agents.0.ageRange.G0.maxSpeed',
					type: 'number',
					value: 1.4,
					placeholder: 'Ingrese la velocidad máxima G0'
				}
			},
			{
				label: 'G1 Prob',
				description: 'Probabilidad G1',
				type: 'input',
				attributes: {
					name: 'agents.0.ageRange.G1.prob',
					type: 'number',
					value: 0.2597,
					placeholder: 'Ingrese la probabilidad G1'
				}
			},
			{
				label: 'G1 Min Speed',
				description: 'Velocidad mínima G1',
				type: 'input',
				attributes: {
					name: 'agents.0.ageRange.G1.minSpeed',
					type: 'number',
					value: 1.28,
					placeholder: 'Ingrese la velocidad mínima G1'
				}
			},
			{
				label: 'G1 Max Speed',
				description: 'Velocidad máxima G1',
				type: 'input',
				attributes: {
					name: 'agents.0.ageRange.G1.maxSpeed',
					type: 'number',
					value: 1.71,
					placeholder: 'Ingrese la velocidad máxima G1'
				}
			},
			{
				label: 'G2 Prob',
				description: 'Probabilidad G2',
				type: 'input',
				attributes: {
					name: 'agents.0.ageRange.G2.prob',
					type: 'number',
					value: 0.4267,
					placeholder: 'Ingrese la probabilidad G2'
				}
			},
			{
				label: 'G2 Min Speed',
				description: 'Velocidad mínima G2',
				type: 'input',
				attributes: {
					name: 'agents.0.ageRange.G2.minSpeed',
					type: 'number',
					value: 1.28,
					placeholder: 'Ingrese la velocidad mínima G2'
				}
			},
			{
				label: 'G2 Max Speed',
				description: 'Velocidad máxima G2',
				type: 'input',
				attributes: {
					name: 'agents.0.ageRange.G2.maxSpeed',
					type: 'number',
					value: 1.71,
					placeholder: 'Ingrese la velocidad máxima G2'
				}
			},
			{
				label: 'G3 Prob',
				description: 'Probabilidad G3',
				type: 'input',
				attributes: {
					name: 'agents.0.ageRange.G3.prob',
					type: 'number',
					value: 0.1485,
					placeholder: 'Ingrese la probabilidad G3'
				}
			},
			{
				label: 'G3 Min Speed',
				description: 'Velocidad mínima G3',
				type: 'input',
				attributes: {
					name: 'agents.0.ageRange.G3.minSpeed',
					type: 'number',
					value: 0.44,
					placeholder: 'Ingrese la velocidad mínima G3'
				}
			},
			{
				label: 'G3 Max Speed',
				description: 'Velocidad máxima G3',
				type: 'input',
				attributes: {
					name: 'agents.0.ageRange.G3.maxSpeed',
					type: 'number',
					value: 1.1,
					placeholder: 'Ingrese la velocidad máxima G3'
				}
			},
			{
				label: 'Time Relax',
				description: 'Tiempo de relajación',
				type: 'input',
				attributes: {
					name: 'agents.0.SFM.timeRelax',
					type: 'number',
					value: 5.0,
					placeholder: 'Ingrese el tiempo de relajación'
				}
			},
			{
				label: 'Sigma',
				description: 'Sigma',
				type: 'input',
				attributes: {
					name: 'agents.0.SFM.sigma',
					type: 'number',
					value: 0.6,
					placeholder: 'Ingrese el sigma'
				}
			},
			{
				label: 'Repulsive Force Agents',
				description: 'Fuerza repulsiva de agentes',
				type: 'input',
				attributes: {
					name: 'agents.0.SFM.repulsiveForceAgents',
					type: 'number',
					value: 50.1,
					placeholder: 'Ingrese la fuerza repulsiva de agentes'
				}
			},
			{
				label: 'Cos Phi',
				description: 'Cos phi',
				type: 'input',
				attributes: {
					name: 'agents.0.SFM.cosphi',
					type: 'number',
					value: -0.17365,
					placeholder: 'Ingrese el cos phi'
				}
			},
			{
				label: 'Emotion Threshold',
				description: 'Umbral de emoción',
				type: 'input',
				attributes: {
					name: 'agents.0.panicModel.emotionThreshold',
					type: 'number',
					value: 0.0,
					placeholder: 'Ingrese el umbral de emoción'
				}
			},
			{
				label: 'Prob Infected To Recovered',
				description: 'Probabilidad de infectado a recuperado',
				type: 'input',
				attributes: {
					name: 'agents.0.panicModel.probInfectedToRecovered',
					type: 'number',
					value: 0.7,
					placeholder: 'Ingrese la probabilidad de infectado a recuperado'
				}
			},
			{
				label: 'Prob Recovered To Susceptible',
				description: 'Probabilidad de recuperado a susceptible',
				type: 'input',
				attributes: {
					name: 'agents.0.panicModel.probRecoveredToSusceptible',
					type: 'number',
					value: 0.3,
					placeholder: 'Ingrese la probabilidad de recuperado a susceptible'
				}
			},
			{
				label: 'Mean Time In Infected',
				description: 'Tiempo medio en infectado',
				type: 'input',
				attributes: {
					name: 'agents.0.panicModel.meanTimeInInfected',
					type: 'number',
					value: 300,
					placeholder: 'Ingrese el tiempo medio en infectado'
				}
			},
			{
				label: 'Sd Time In Infected',
				description: 'Desviación estándar de tiempo en infectado',
				type: 'input',
				attributes: {
					name: 'agents.0.panicModel.sdTimeInInfected',
					type: 'number',
					value: 1.0,
					placeholder: 'Ingrese la desviación estándar de tiempo en infectado'
				}
			},
			{
				label: 'Mean Time In Recovered',
				description: 'Tiempo medio en recuperado',
				type: 'input',
				attributes: {
					name: 'agents.0.panicModel.meanTimeInRecovered',
					type: 'number',
					value: 300,
					placeholder: 'Ingrese el tiempo medio en recuperado'
				}
			},
			{
				label: 'Sd Time In Recovered',
				description: 'Desviación estándar de tiempo en recuperado',
				type: 'input',
				attributes: {
					name: 'agents.0.panicModel.sdTimeInRecovered',
					type: 'number',
					value: 1.0,
					placeholder: 'Ingrese la desviación estándar de tiempo en recuperado'
				}
			}
		],
		visitors: [
			{
				label: 'Model',
				description: 'Modelo',
				type: 'input',
				attributes: {
					name: 'agents.1.model',
					type: 'text',
					placeholder: 'Ingrese el modelo',
					value: 'Visitors',
					readonly: true
				}
			},
			{
				label: 'Number',
				description: 'Número',
				type: 'input',
				attributes: {
					name: 'agents.1.number',
					type: 'number',
					value: 0,
					placeholder: 'Ingrese el número'
				}
			},
			{
				label: 'Tau',
				description: 'Tau',
				type: 'input',
				attributes: {
					name: 'agents.1.responseTime.tau',
					type: 'number',
					value: 0,
					placeholder: 'Ingrese el tau'
				}
			},
			{
				label: 'Sigma',
				description: 'Sigma',
				type: 'input',
				attributes: {
					name: 'agents.1.responseTime.sigma',
					type: 'number',
					value: 383.0,
					placeholder: 'Ingrese el sigma'
				}
			},
			{
				label: 'Mean Time Take Phone',
				description: 'Tiempo medio de toma de teléfono',
				type: 'input',
				attributes: {
					name: 'agents.1.phoneUse.meanTimeTakePhone',
					type: 'number',
					value: 5.0,
					placeholder: 'Ingrese el tiempo medio de toma de teléfono'
				}
			},
			{
				label: 'Prob Phone Use Const',
				description: 'Probabilidad de uso de teléfono constante',
				type: 'input',
				attributes: {
					name: 'agents.1.phoneUse.probPhoneUseConst',
					type: 'number',
					value: 10,
					placeholder: 'Ingrese la probabilidad de uso de teléfono constante'
				}
			},
			{
				label: 'G0 Prob',
				description: 'Probabilidad G0',
				type: 'input',
				attributes: {
					name: 'agents.1.ageRange.G0.prob',
					type: 'number',
					value: 0.1651,
					placeholder: 'Ingrese la probabilidad G0'
				}
			},
			{
				label: 'G0 Min Speed',
				description: 'Velocidad mínima G0',
				type: 'input',
				attributes: {
					name: 'agents.1.ageRange.G0.minSpeed',
					type: 'number',
					value: 1.04,
					placeholder: 'Ingrese la velocidad mínima G0'
				}
			},
			{
				label: 'G0 Max Speed',
				description: 'Velocidad máxima G0',
				type: 'input',
				attributes: {
					name: 'agents.1.ageRange.G0.maxSpeed',
					type: 'number',
					value: 1.4,
					placeholder: 'Ingrese la velocidad máxima G0'
				}
			},
			{
				label: 'G1 Prob',
				description: 'Probabilidad G1',
				type: 'input',
				attributes: {
					name: 'agents.1.ageRange.G1.prob',
					type: 'number',
					value: 0.2597,
					placeholder: 'Ingrese la probabilidad G1'
				}
			},
			{
				label: 'G1 Min Speed',
				description: 'Velocidad mínima G1',
				type: 'input',
				attributes: {
					name: 'agents.1.ageRange.G1.minSpeed',
					type: 'number',
					value: 1.28,
					placeholder: 'Ingrese la velocidad mínima G1'
				}
			},
			{
				label: 'G1 Max Speed',
				description: 'Velocidad máxima G1',
				type: 'input',
				attributes: {
					name: 'agents.1.ageRange.G1.maxSpeed',
					type: 'number',
					value: 1.68,
					placeholder: 'Ingrese la velocidad máxima G1'
				}
			},
			{
				label: 'G2 Prob',
				description: 'Probabilidad G2',
				type: 'input',
				attributes: {
					name: 'agents.1.ageRange.G2.prob',
					type: 'number',
					value: 0.4267,
					placeholder: 'Ingrese la probabilidad G2'
				}
			},
			{
				label: 'G2 Min Speed',
				description: 'Velocidad mínima G2',
				type: 'input',
				attributes: {
					name: 'agents.1.ageRange.G2.minSpeed',
					type: 'number',
					value: 1.08,
					placeholder: 'Ingrese la velocidad mínima G2'
				}
			},
			{
				label: 'G2 Max Speed',
				description: 'Velocidad máxima G2',
				type: 'input',
				attributes: {
					name: 'agents.1.ageRange.G2.maxSpeed',
					type: 'number',
					value: 1.6,
					placeholder: 'Ingrese la velocidad máxima G2'
				}
			},
			{
				label: 'G3 Prob',
				description: 'Probabilidad G3',
				type: 'input',
				attributes: {
					name: 'agents.1.ageRange.G3.prob',
					type: 'number',
					value: 0.1485,
					placeholder: 'Ingrese la probabilidad G3'
				}
			},
			{
				label: 'G3 Min Speed',
				description: 'Velocidad mínima G3',
				type: 'input',
				attributes: {
					name: 'agents.1.ageRange.G3.minSpeed',
					type: 'number',
					value: 0.41,
					placeholder: 'Ingrese la velocidad mínima G3'
				}
			},
			{
				label: 'G3 Max Speed',
				description: 'Velocidad máxima G3',
				type: 'input',
				attributes: {
					name: 'agents.1.ageRange.G3.maxSpeed',
					type: 'number',
					value: 0.93,
					placeholder: 'Ingrese la velocidad máxima G3'
				}
			},
			{
				label: 'Time Relax',
				description: 'Tiempo de relajación',
				type: 'input',
				attributes: {
					name: 'agents.1.SFM.timeRelax',
					type: 'number',
					value: 1.5,
					placeholder: 'Ingrese el tiempo de relajación'
				}
			},
			{
				label: 'Sigma',
				description: 'Sigma',
				type: 'input',
				attributes: {
					name: 'agents.1.SFM.sigma',
					type: 'number',
					value: 0.1,
					placeholder: 'Ingrese el sigma'
				}
			},
			{
				label: 'Repulsive Force Agents',
				description: 'Fuerza repulsiva de agentes',
				type: 'input',
				attributes: {
					name: 'agents.1.SFM.repulsiveForceAgents',
					type: 'number',
					value: 50.1,
					placeholder: 'Ingrese la fuerza repulsiva de agentes'
				}
			},
			{
				label: 'Cos Phi',
				description: 'Cos phi',
				type: 'input',
				attributes: {
					name: 'agents.1.SFM.cosphi',
					type: 'number',
					value: 0.17365,
					placeholder: 'Ingrese el cos phi'
				}
			},
			{
				label: 'Emotion Threshold',
				description: 'Umbral de emoción',
				type: 'input',
				attributes: {
					name: 'agents.1.panicModel.emotionThreshold',
					type: 'number',
					value: 0.6,
					placeholder: 'Ingrese el umbral de emoción'
				}
			},
			{
				label: 'Prob Infected To Recovered',
				description: 'Probabilidad de infectado a recuperado',
				type: 'input',
				attributes: {
					name: 'agents.1.panicModel.probInfectedToRecovered',
					type: 'number',
					value: 0.7,
					placeholder: 'Ingrese la probabilidad de infectado a recuperado'
				}
			},
			{
				label: 'Prob Recovered To Susceptible',
				description: 'Probabilidad de recuperado a susceptible',
				type: 'input',
				attributes: {
					name: 'agents.1.panicModel.probRecoveredToSusceptible',
					type: 'number',
					value: 0.3,
					placeholder: 'Ingrese la probabilidad de recuperado a susceptible'
				}
			},
			{
				label: 'Mean Time In Infected',
				description: 'Tiempo medio en infectado',
				type: 'input',
				attributes: {
					name: 'agents.1.panicModel.meanTimeInInfected',
					type: 'number',
					value: 300,
					placeholder: 'Ingrese el tiempo medio en infectado'
				}
			},
			{
				label: 'Sd Time In Infected',
				description: 'Desviación estándar de tiempo en infectado',
				type: 'input',
				attributes: {
					name: 'agents.1.panicModel.sdTimeInInfected',
					type: 'number',
					value: 1.0,
					placeholder: 'Ingrese la desviación estándar de tiempo en infectado'
				}
			},
			{
				label: 'Mean Time In Recovered',
				description: 'Tiempo medio en recuperado',
				type: 'input',
				attributes: {
					name: 'agents.1.panicModel.meanTimeInRecovered',
					type: 'number',
					value: 300,
					placeholder: 'Ingrese el tiempo medio en recuperado'
				}
			},
			{
				label: 'Sd Time In Recovered',
				description: 'Desviación estándar de tiempo en recuperado',
				type: 'input',
				attributes: {
					name: 'agents.1.panicModel.sdTimeInRecovered',
					type: 'number',
					value: 1.0,
					placeholder: 'Ingrese la desviación estándar de tiempo en recuperado'
				}
			}
		]
	}
} satisfies FormSchema;

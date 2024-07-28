import type { RequestHandler } from './$types';
import type { ParametersSchema, SimulatorDirectives } from '$lib/types';

import { join } from 'node:path';
import { json } from '@sveltejs/kit';
import { parametersFormFields } from '$lib/config';
import { PUBLIC_PARAMETERS_FILENAME } from '$env/static/public';
import { basePath, createFile, isFile, readFile } from '$lib/server/utils';
import {
	deflattenJSON,
	getValidationSchema,
	stringifyZodFieldErrors,
	preprocessParametersData
} from '$lib/utils';

export const POST = (async ({ request }) => {
	const { type, config } = await request.json();

	if (!type || !config) {
		return json({
			error: {
				code: 400,
				message: 'No se ha proporcionado un archivo de configuración.'
			}
		});
	}

	let parameters: ParametersSchema;

	if (type === 'local') {
		const { success: validConfig, errors: configErrors } = verifyIntegrity(config);

		if (!validConfig && configErrors) {
			return json({
				error: {
					code: 400,
					message: stringifyZodFieldErrors(configErrors)
				}
			});
		}

		parameters = preprocessParametersData(deflattenJSON(config) as ParametersSchema);
	} else if (type === 'server') {
		if (!isFile(config)) {
			return json({
				error: {
					code: 404,
					message: 'No se encuentra el archivo de configuración seleccionado.'
				}
			});
		}

		const configData = readFile(config);

		if (!configData) {
			return json({
				error: {
					code: 400,
					message: 'No se pudo obtener la información del archivo de configuración seleccionado.'
				}
			});
		}

		try {
			parameters = JSON.parse(configData);
		} catch {
			return json({
				error: {
					code: 400,
					message: 'El archivo de configuración seleccionado no es válido.'
				}
			});
		}
	} else {
		return json({
			error: {
				code: 400,
				message: 'Hubo un error enviando la información al servidor.'
			}
		});
	}

	const {
		baseDirSim,
		floodModelEnable,
		input: { directory: inputDirectory, zones },
		output: {
			directory: outputDirectory,
			'agents-out': agentsOut,
			'agents-path': agentsPath,
			'agents-sufix': agentsSufix
		},
		floodParams: { stateEnable, stateDir }
	} = parameters;

	const fullInputDirectory = addTrailingSlash(join(baseDirSim, inputDirectory));
	const fullOutputDirectory = addTrailingSlash(join(baseDirSim, outputDirectory));
	const enableFloodWatcher = floodModelEnable && stateEnable;
	const floodDir = addTrailingSlash(join(fullOutputDirectory, stateDir));
	const agentsDir = addTrailingSlash(join(fullOutputDirectory, agentsPath));
	const configFile = type === 'local' ? PUBLIC_PARAMETERS_FILENAME : config.split('/').at(-1);

	const simulatorDirectives: SimulatorDirectives = {
		configFile,
		baseDirSim: addTrailingSlash(baseDirSim),
		zones,
		floodEnabled: enableFloodWatcher,
		inputDirectory: fullInputDirectory,
		outputDirectory: fullOutputDirectory,
		agentsOut,
		agentsDir,
		agentsSufix,
		floodDir
	};

	// Create simulator ini file
	const iniFileCreated = createSimulatorLaunchFile(simulatorDirectives);

	if (!iniFileCreated) {
		return json({
			error: {
				code: 500,
				message: 'No se pudo crear el archivo para iniciar el simulador.'
			}
		});
	}

	// Create simulator config file
	if (type === 'local') {
		const configFileCreated = createFile(
			baseDirSim,
			configFile,
			JSON.stringify(parameters, null, '\t'),
			true
		);

		if (!configFileCreated) {
			return json({
				error: {
					code: 500,
					message: 'No se pudo crear el archivo de configuración.'
				}
			});
		}
	}

	return json({ directives: simulatorDirectives });
}) satisfies RequestHandler;

function verifyIntegrity(config: Record<string, unknown>) {
	const schema = getValidationSchema(parametersFormFields);
	const { success, error } = schema.safeParse(config);
	const errors = error?.flatten().fieldErrors;
	return { success, errors };
}

function addTrailingSlash(path: string) {
	if (path.endsWith('/')) return path;

	return path + '/';
}

/**
 * *: This function is used to create a .ini file in the root directory of the app.
 * *: It sets the required values to launch correctle the simulator as children process.
 */
function createSimulatorLaunchFile(data: Record<string, unknown>) {
	const iniFilename = 'sim.ini';

	const iniFileData = Object.entries(data)
		.map(([key, value]) => `${key}=${value}`)
		.join('\n');

	const iniFileCreated = createFile(basePath, iniFilename, iniFileData, true);

	return iniFileCreated;
}

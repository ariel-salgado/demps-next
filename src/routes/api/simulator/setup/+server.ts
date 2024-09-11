import type { RequestHandler } from './$types';
import type { ParametersSchema, SimulatorDirectives } from '$lib/types';

import { join } from 'node:path';
import { json } from '@sveltejs/kit';
import { parametersFormFields } from '$lib/config';
import { basePath, createFile, isFile, readFile } from '$lib/server/utils';
import { PUBLIC_PARAMETERS_FILENAME, PUBLIC_SIM_DIR } from '$env/static/public';
import { deflattenJSON, getValidationSchema, stringifyZodFieldErrors } from '$lib/utils';

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

	// Verify the configuration file stored in the form
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

		parameters = deflattenJSON(config) as ParametersSchema;

		// Verify the configuration file stored in the server
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
		floodModelEnable,
		input: { zones },
		output: { directory: outputDirectory, 'agents-path': agentsPath },
		floodParams: { stateEnable, stateDir }
	} = parameters;

	const agentsDir: string = join(outputDirectory, agentsPath);
	const floodDir: string = join(outputDirectory, stateDir);
	const floodEnabled = floodModelEnable && stateEnable;
	const configFile =
		type === 'local' ? PUBLIC_PARAMETERS_FILENAME : config.split('/').filter(Boolean).at(-1);

	const simulatorDirectives: SimulatorDirectives = {
		agentsDir,
		configFile,
		floodDir,
		floodEnabled,
		zones
	};

	// Create .ini file
	const iniFileCreated = createSimulatorLaunchFile(simulatorDirectives);

	if (!iniFileCreated) {
		return json({
			error: {
				code: 500,
				message: 'No se pudo crear el archivo para iniciar el simulador.'
			}
		});
	}

	// Create parameters.config file
	if (type === 'local') {
		const configFileCreated = createFile(
			PUBLIC_SIM_DIR,
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

/**
 * *: This function is used to create a .ini file in the root directory of the app.
 * *: It sets the required values to launch correctly the simulator as children process.
 */
function createSimulatorLaunchFile(data: Record<string, unknown>) {
	const iniFilename = 'sim.ini';

	const iniFileData = Object.entries(data)
		.map(([key, value]) => `${key}=${value}`)
		.join('\n');

	const iniFileCreated = createFile(basePath, iniFilename, iniFileData, true);

	return iniFileCreated;
}

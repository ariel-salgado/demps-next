import type { RequestHandler } from './$types';
import type { ParametersSchema } from '$lib/types';

import { join } from 'node:path';
import { json } from '@sveltejs/kit';
import { createFile } from '$lib/server/utils';
import { parametersFormFields } from '$lib/config';
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

		const parameters = preprocessParametersData(deflattenJSON(config) as ParametersSchema);

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

		const fullInputDirectory = join(baseDirSim, inputDirectory);
		const fullOutputDirectory = join(baseDirSim, outputDirectory);
		const enableFloodWatcher = floodModelEnable && stateEnable;
		const floodDir = join(fullOutputDirectory, stateDir);
		const agentsDir = join(fullOutputDirectory, agentsPath);

		const simulatorDirectives = {
			baseDirSim,
			zones,
			floodEnabled: enableFloodWatcher,
			inputDirectory: fullInputDirectory,
			outputDirectory: fullOutputDirectory,
			agentsOut,
			agentsDir,
			agentsSufix,
			floodDir
		};

		// Create simulator config file
		const configFileCreated = createFile(
			baseDirSim,
			'parameters.config',
			JSON.stringify(parameters, null, '\t')
		);

		if (!configFileCreated) {
			return json({
				error: {
					code: 500,
					message: 'No se pudo crear el archivo de configuración.'
				}
			});
		}

		return json({ directives: simulatorDirectives });
	}

	// TODO: Implement remote setup

	return json({ content: 'hola' });
}) satisfies RequestHandler;

function verifyIntegrity(config: Record<string, unknown>) {
	const schema = getValidationSchema(parametersFormFields);
	const { success, error } = schema.safeParse(config);
	const errors = error?.flatten().fieldErrors;
	return { success, errors };
}

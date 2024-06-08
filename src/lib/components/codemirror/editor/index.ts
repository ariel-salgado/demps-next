import type { Environment } from '$lib/states';
import type { EditorView } from '@codemirror/view';

export type EditorContext = {
	editor: EditorView;
	environment: Environment;
};

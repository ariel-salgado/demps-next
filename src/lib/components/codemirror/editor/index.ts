import type { Environment } from '$lib/states';
import type { EditorView } from '@codemirror/view';

import Editor, { contextKey } from './editor.svelte';

type EditorContext = {
	editor: EditorView;
	environment: Environment;
};

export type { EditorContext };

export { Editor, contextKey };

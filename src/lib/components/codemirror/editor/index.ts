import type { Environment } from '$lib/states';
import type { EditorView } from '@codemirror/view';

import Editor from './editor.svelte';
import { contextKey } from './context';

type EditorContext = {
	editor: EditorView;
	environment: Environment;
};

export type { EditorContext };

export { Editor, contextKey };

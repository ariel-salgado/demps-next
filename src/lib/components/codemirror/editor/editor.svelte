<script context="module" lang="ts">
	import { extensions } from './extensions';
	import { EditorView } from '@codemirror/view';
	import { EditorState } from '@codemirror/state';
	import { isValidGeoJSON, strEqualsObj } from '$lib/utils';

	export const contextKey = Symbol();
</script>

<script lang="ts">
	import type { Action } from 'svelte/action';
	import type { Environment } from '$lib/states';
	import type { FeatureCollection } from 'geojson';

	import { setContext } from 'svelte';

	type Parameters = Environment;

	type EditorAction = Action<HTMLElement, Parameters>;

	interface Props {
		environment: Environment;
	}

	const { environment }: Props = $props();

	let editor: EditorView | undefined = $state();

	setContext(contextKey, {
		get editor() {
			return editor;
		}
	});

	function updateEditor(value: FeatureCollection) {
		const { doc } = editor!.state;

		if (!strEqualsObj(doc.toString(), value) && isValidGeoJSON(value)) {
			editor?.dispatch({
				changes: {
					from: 0,
					to: doc.length,
					insert: JSON.stringify(value, null, 2)
				}
			});
		}
	}

	const initEditor: EditorAction = (editorContainer, environment) => {
		editor = new EditorView({
			parent: editorContainer,
			state: EditorState.create({
				doc: JSON.stringify(environment.value, null, 2),
				extensions: [extensions]
			})
		});

		$effect(() => {
			updateEditor(environment.value);
		});

		return {
			destroy() {
				editorContainer.remove();
				editor?.destroy();
				editor = undefined;
			}
		};
	};
</script>

<div class="contents" use:initEditor={environment}></div>

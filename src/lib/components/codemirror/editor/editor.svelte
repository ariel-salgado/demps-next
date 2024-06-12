<script context="module" lang="ts">
	import { extensions } from './extensions';
	import { EditorView } from '@codemirror/view';
	import { EditorState } from '@codemirror/state';
	import { debounce, isValidGeoJSON, strEqualsObj } from '$lib/utils';

	export const contextKey = Symbol();
</script>

<script lang="ts">
	import type { G } from '$lib/types';
	import type { Snippet } from 'svelte';
	import type { Action } from 'svelte/action';
	import type { Environment } from '$lib/states';
	import type { FeatureCollection } from 'geojson';

	import { setContext } from 'svelte';

	type Parameters = Environment;

	type EditorAction = Action<HTMLElement, Parameters>;

	interface Props {
		children?: Snippet;
		environment: Environment;
		onChanges?: () => void;
	}

	const { children, environment, onChanges }: Props = $props();

	let editor: EditorView | undefined = $state();

	setContext(contextKey, {
		get editor() {
			return editor;
		},
		get environment() {
			return environment;
		}
	});

	const updateEnvironment = debounce((value: string) => {
		const geojson = JSON.parse(value) as FeatureCollection<G>;

		if (isValidGeoJSON(geojson) && !strEqualsObj(value, environment.value)) {
			environment.value = geojson;

			if (onChanges) onChanges();
		}
	}, 1000);

	const handleChanges = EditorView.updateListener.of(({ state, docChanged }) => {
		if (docChanged) updateEnvironment(state.doc.toString());
	});

	function updateEditor(value: FeatureCollection) {
		const { doc } = editor!.state;

		if (isValidGeoJSON(value) && !strEqualsObj(doc.toString(), value)) {
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
				extensions: [extensions, handleChanges]
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

<div class="contents" use:initEditor={environment}>
	{#if children}
		<div class="sticky top-6 z-10 float-right mr-12 size-0">
			{@render children()}
		</div>
	{/if}
</div>

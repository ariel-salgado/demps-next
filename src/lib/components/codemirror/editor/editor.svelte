<script context="module" lang="ts">
	export const contextKey = Symbol();
</script>

<script lang="ts">
	import type { G } from '$lib/types';
	import type { Snippet } from 'svelte';
	import type { Action } from 'svelte/action';
	import type { Environment } from '$lib/states';
	import type { FeatureCollection } from 'geojson';

	import { setContext } from 'svelte';
	import { extensions } from './extensions';
	import { EditorView } from '@codemirror/view';
	import { EditorState } from '@codemirror/state';
	import { debounce, isValidGeoJSON, strEqualsObj } from '$lib/utils';

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
		if (!isValidGeoJSON(value) || strEqualsObj(value, environment.value)) return;

		try {
			environment.value = JSON.parse(value) as FeatureCollection<G>;

			if (onChanges) onChanges();
		} catch {
			// The editor shows the error message
		}
	}, 1000);

	const handleChanges = EditorView.updateListener.of(({ state, docChanged }) => {
		if (!docChanged) return;

		updateEnvironment(state.doc.toString());
	});

	// ?: Just update the affected code
	function updateEditor(value: FeatureCollection) {
		const { doc } = editor!.state;

		if (!isValidGeoJSON(value) || strEqualsObj(doc.toString(), value)) return;

		editor?.dispatch({
			changes: {
				from: 0,
				to: doc.length,
				insert: JSON.stringify(value, null, 2)
			}
		});
	}

	const initEditor: Action<HTMLElement, Environment> = (editorContainer, environment) => {
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
				editor?.destroy();
				editor = undefined;
			}
		};
	};
</script>

<div class="contents" use:initEditor={environment}>
	{#if editor && children}
		<div class="sticky top-7 z-50 float-right mr-14 size-0 space-y-3">
			{@render children()}
		</div>
	{/if}
</div>

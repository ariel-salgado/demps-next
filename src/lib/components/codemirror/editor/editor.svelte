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
	import { contextKey } from '$lib/components/codemirror';
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

	/**
	 * If the value is a valid GeoJSON and is different from the actual value
	 * updates the environment value to the content in the editor.
	 */
	const updateEnvironment = debounce((value: string) => {
		if (!isValidGeoJSON(value) || strEqualsObj(value, environment.value)) return;

		try {
			environment.value = JSON.parse(value) as FeatureCollection<G>;

			if (onChanges) onChanges();
		} catch {
			// The editor shows the error message
		}
	}, 1000);

	/**
	 * Listens for changes in the editor.
	 */
	const handleChanges = EditorView.updateListener.of(({ state, docChanged }) => {
		if (!docChanged) return;

		updateEnvironment(state.doc.toString());
	});

	/**
	 * If the environment value changes updates the editor content only if
	 * the environment value is a valid GeoJSON and it's different from the current editor contents.
	 */
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

	/**
	 * Initializes the editor.
	 */
	const initEditor: Action<HTMLElement, Environment> = (
		editorContainer: HTMLElement,
		environment: Environment
	) => {
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
			}
		};
	};
</script>

<div class="isolate contents" use:initEditor={environment}>
	{#if editor && children}
		<div class="sticky top-7 z-50 float-right mr-14 size-0">
			<div
				class="flex flex-col gap-y-4 *:w-8 *:rounded-md *:leading-none *:outline *:outline-slate-700/80"
			>
				{@render children()}
			</div>
		</div>
	{/if}
</div>

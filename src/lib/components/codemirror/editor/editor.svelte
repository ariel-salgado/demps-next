<script context="module" lang="ts">
	import { extensions } from './extensions';
	import { EditorView } from '@codemirror/view';
	import { EditorState } from '@codemirror/state';

	export const contextKey = Symbol();
</script>

<script lang="ts">
	import type { Action } from 'svelte/action';
	import type { Environment } from '$lib/states/env.svelte';

	import { setContext } from 'svelte';

	type Parameters = Environment;

	type EditorAction = Action<HTMLElement, Parameters>;

	interface Props {
		environment: Environment;
	}

	let { environment = $bindable() }: Props = $props();

	let editor: EditorView | undefined = $state();

	setContext(contextKey, {
		get editor() {
			return editor;
		}
	});

	const initEditor: EditorAction = (editorContainer, environment) => {
		editor = new EditorView({
			parent: editorContainer,
			state: EditorState.create({
				doc: JSON.stringify(environment.value, null, 2),
				extensions: [extensions]
			})
		});

		return {
			update() {},
			destroy() {
				editorContainer.remove();
			}
		};
	};
</script>

<div class="contents" use:initEditor={environment}></div>

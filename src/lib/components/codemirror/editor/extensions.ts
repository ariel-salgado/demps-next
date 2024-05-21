import type { Extension } from '@codemirror/state';

import { EditorState } from '@codemirror/state';
import { json, jsonParseLinter } from '@codemirror/lang-json';
import { lintGutter, lintKeymap, linter } from '@codemirror/lint';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import {
	keymap,
	highlightSpecialChars,
	drawSelection,
	highlightActiveLine,
	dropCursor,
	rectangularSelection,
	crosshairCursor,
	lineNumbers,
	highlightActiveLineGutter,
	EditorView
} from '@codemirror/view';
import {
	defaultHighlightStyle,
	syntaxHighlighting,
	indentOnInput,
	bracketMatching,
	foldGutter,
	foldKeymap
} from '@codemirror/language';
import {
	autocompletion,
	completionKeymap,
	closeBrackets,
	closeBracketsKeymap
} from '@codemirror/autocomplete';

const theme: Extension = EditorView.theme({
	'&.cm-focused': {
		outline: 'none'
	},
	'.cm-gutters': {
		userSelect: 'none',
		borderRight: 'none',
		backgroundColor: '#fff'
	},
	'.cm-gutter-lint': {
		width: '2rem',
		textAlign: '-webkit-center'
	},
	'.cm-gutterElement': {
		color: '#525252',
		padding: '0 0.2rem',
		minWidth: '1.5rem !important'
	},
	'.cm-activeLine': {
		backgroundColor: '#f3f3f3'
	},
	'.cm-activeLineGutter': {
		backgroundColor: '#f3f3f3'
	},
	'.cm-lineNumbers': {
		color: '#aaa'
	},
	'.cm-gutterElement > span[title="Fold line"]': {
		color: '#aaa'
	},
	'.cm-lineNumbers > .cm-activeLineGutter': {
		color: '#222'
	},
	'.cm-gutterElement .cm-activeLineGutter > span[title="Fold line"]': {
		color: '#222'
	},
	'.cm-scroller': {
		height: '100%',
		overflow: 'auto',
		fontFamily: 'Consolas, Menlo, Monaco, source-code-pro, Courier New, monospace'
	},
	'.cm-tooltip': {
		overflow: 'hidden',
		background: 'white',
		borderRadius: '0.5rem'
	},
	'& .cm-diagnostic-error': {
		backgroundColor: '#ffeaea'
	}
});

export const extensions: Extension = (() => [
	theme,
	json(),
	history(),
	dropCursor(),
	lintGutter(),
	lineNumbers(),
	drawSelection(),
	closeBrackets(),
	indentOnInput(),
	autocompletion(),
	bracketMatching(),
	crosshairCursor(),
	highlightActiveLine(),
	rectangularSelection(),
	highlightSpecialChars(),
	EditorView.lineWrapping,
	linter(jsonParseLinter()),
	highlightSelectionMatches(),
	highlightActiveLineGutter(),
	EditorState.allowMultipleSelections.of(true),
	syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
	foldGutter({
		openText: '▾',
		closedText: '▸'
	}),
	keymap.of([
		...closeBracketsKeymap,
		...defaultKeymap,
		...searchKeymap,
		...historyKeymap,
		...foldKeymap,
		...completionKeymap,
		...lintKeymap
	]),
	EditorView.contentAttributes.of({
		'aria-label': 'GeoJSON editor'
	})
])();

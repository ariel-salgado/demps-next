// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	interface Document {
		startViewTransition(updateCallback: () => Promise<void> | void): ViewTransition;
	}

	interface ViewTransition {
		finished: Promise<void>;
		ready: Promise<void>;
		updateCallbackDone: Promise<void>;
		skipTransition(): void;
	}

	interface CSSStyleDeclaration {
		viewTransitionName: string;
	}
}

export {};

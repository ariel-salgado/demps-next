import type { Writable } from 'svelte/store';

import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { SvelteMap } from 'svelte/reactivity';

declare type SourceEventTypes = 'open' | 'error' | string;
declare type SourceEventData<T extends SourceEventTypes> = T extends 'open' | 'error'
	? Event
	: string;

export class Source {
	private url: string | URL;
	private source: EventSource | null;
	private events: SvelteMap<SourceEventTypes, { data: Writable<any>; listener: EventListener }>;

	constructor(url: string | URL) {
		this.url = url;
		this.source = null;
		this.events = new SvelteMap();
		this.init();
	}

	private init() {
		if (browser) {
			this.source = new EventSource(this.url);
			this.attach_event_listeners();
		}
	}

	private attach_event_listeners() {
		for (const [event_name, { listener }] of this.events.entries()) {
			this.source?.addEventListener(event_name, listener);
		}
	}

	private get_store<T = any>(event_name: string) {
		return this.events.get(event_name)?.data as Writable<T> | undefined;
	}

	private get_listener(event_name: string) {
		return this.events.get(event_name)?.listener;
	}

	listen<T extends SourceEventTypes, O = any>(
		event_name: T,
		refine: (data: SourceEventData<T>) => O = (data) => data as unknown as O
	): Writable<O> {
		if (!this.events.has(event_name)) {
			const listener =
				event_name === 'open' || event_name === 'error'
					? (event: Event) => {
							this.get_store(event_name)?.set(refine(event as SourceEventData<T>));
						}
					: (((event: MessageEvent) => {
							this.get_store(event_name)?.set(refine(event.data) as string);
						}) as EventListener);

			this.events.set(event_name, {
				data: writable(),
				listener: listener
			});
		}

		const { data, listener } = this.events.get(event_name)!;
		this.source?.addEventListener(event_name, listener);

		return data;
	}

	unlisten(event_name: string) {
		const event_listener = this.get_listener(event_name);

		if (!event_listener) return;

		this.source?.removeEventListener(event_name, event_listener);
		this.events.delete(event_name);
	}

	open(callback?: (event?: Event) => void) {
		const result = this.listen('open', (event) => {
			if (callback) {
				callback(event);
			}

			return true;
		});

		return result;
	}

	error(callback: (event?: Event) => void) {
		this.listen('error', (event) => {
			callback(event);
		});
	}

	close(callback?: () => void) {
		if (!this.source) return;

		this.source?.close();

		if (this.source?.readyState === 2) {
			this.get_store('open')?.set(false);

			if (callback) {
				callback();
			}
		}

		this.source = null;
	}

	reconnect() {
		this.close();
		this.init();
	}
}

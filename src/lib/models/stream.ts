import { LinkedList } from '.';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';

const current_streams: SvelteMap<string, Stream> = new SvelteMap();

declare type StreamEventData = {
	name: string;
	data: any;
	id?: string;
};

export class Stream {
	private stream: ReadableStream;
	private controller: ReadableStreamDefaultController | null = null;
	private on_close_callback: (() => void) | null = null;

	private pending_events: SvelteSet<string> = new SvelteSet();
	private events_buffers: SvelteMap<string, LinkedList<StreamEventData>> = new SvelteMap();

	private is_synced: boolean = false;
	private sync_timeout_id: ReturnType<typeof setTimeout> | null = null;

	constructor() {
		if (current_streams.has('demps')) {
			const stream = current_streams.get('demps');
			stream?.close();
		}

		this.stream = new ReadableStream({
			start: this.initialize_stream.bind(this),
			cancel: this.close.bind(this)
		});

		current_streams.set('demps', this);
	}

	private initialize_stream(controller: ReadableStreamDefaultController) {
		this.controller = controller;
	}

	private try_to_send_synced_events() {
		if (this.are_all_events_ready()) {
			this.send_synced_events();
		}
	}

	private are_all_events_ready() {
		for (const event_name of this.pending_events) {
			const buffer = this.events_buffers.get(event_name);
			if (buffer?.is_empty()) return false;
		}
		return true;
	}

	private send_synced_events() {
		if (!this.controller) return;

		try {
			let message = '';
			for (const buffer of this.events_buffers.values()) {
				const event = buffer.remove_first();
				if (event) {
					message += this.format_message(event);
				}
			}
			this.handle_backpressure();
			this.controller.enqueue(message);
		} catch {
			// console.error('Error sending synced data:', error);
		}
	}

	send(event: StreamEventData) {
		if (!this.controller) return;

		try {
			const message = this.format_message(event);
			this.handle_backpressure();
			this.controller.enqueue(message);
		} catch {
			// console.error('Error sending data:', error);
		}
	}

	sync_and_send(event: StreamEventData) {
		if (!this.controller) return;

		let buffer = this.events_buffers.get(event.name);
		if (!buffer) {
			buffer = new LinkedList<StreamEventData>();
			this.events_buffers.set(event.name, buffer);
			this.pending_events.add(event.name);
		}
		buffer.append(event);

		if (!this.is_synced) {
			this.schedule_synced_send();
		} else {
			this.try_to_send_synced_events();
		}
	}

	private schedule_synced_send() {
		if (this.sync_timeout_id === null) {
			this.sync_timeout_id = setTimeout(() => {
				this.try_to_send_synced_events();
				this.is_synced = true;
				this.sync_timeout_id = null;
			}, 100);
		}
	}

	on_close(callback: () => void) {
		this.on_close_callback = callback;
	}

	close() {
		if (this.controller) {
			this.controller.close();
			this.handle_close();
		}
	}

	response(headers: Record<string, string> = {}) {
		const response_headers = new Headers({
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
			...headers
		});

		return new Response(this.stream, {
			headers: response_headers
		});
	}

	private format_message(event: StreamEventData) {
		let message = `event: ${event.name}\n`;
		if (event.id) {
			message += `id: ${event.id}\n`;
		}
		message += `data: ${typeof event.data === 'string' ? event.data : JSON.stringify(event.data)}\n\n`;
		return message;
	}

	private handle_backpressure() {
		if (this.controller) {
			const desired_size = this.controller.desiredSize;
			if (desired_size !== null && desired_size < 1) {
				// console.warn('Backpressure detected, slowing down event flow.');
			}
		}
	}

	private handle_close() {
		if (this.on_close_callback) {
			this.on_close_callback();
		}
		this.cleanup();
	}

	private cleanup() {
		this.controller = null;
		this.on_close_callback = null;
		this.events_buffers.clear();
		this.pending_events.clear();
		this.is_synced = false;
		if (this.sync_timeout_id !== null) {
			clearTimeout(this.sync_timeout_id);
			this.sync_timeout_id = null;
		}
	}
}

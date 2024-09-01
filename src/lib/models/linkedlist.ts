class Node<T> {
	data: T;
	next: Node<T> | null = null;

	constructor(data: T) {
		this.data = data;
	}
}

export class LinkedList<T> {
	private head: Node<T> | null = null;
	private tail: Node<T> | null = null;

	append(data: T) {
		const new_node = new Node(data);
		if (!this.tail) {
			this.head = this.tail = new_node;
		} else {
			this.tail.next = new_node;
			this.tail = new_node;
		}
	}

	remove_first(): T | null {
		if (!this.head) return null;
		const data = this.head.data;
		this.head = this.head.next;
		if (!this.head) {
			this.tail = null;
		}
		return data;
	}

	is_empty(): boolean {
		return this.head === null;
	}
}

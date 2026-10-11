
import {guarantee} from "@e280/stz"

export type Trackable = object | symbol

/**
 * reactivity integration hub
 */
export class Tracker<Item extends Trackable = any> {
	#busy = new Set<() => void>()
	#observationLayers: Set<Item>[] = []
	#subscriptions = new WeakMap<Item, Set<() => void>>()
	#invalidators = new WeakMap<Item, Set<() => void>>()

	#batchDepth = 0
	#pendingInvalidations = new Set<() => void>()
	#pendingReactions = new Set<() => void>()
	#invalidating = false

	/** indicate to observers that this item was accessed */
	read(item: Item) {
		const top = this.#observationLayers.at(-1)
		top?.add(item)
	}

	write(item: Item) {
		for (const fn of this.#invalidators.get(item) ?? [])
			this.#enqueue(this.#pendingInvalidations, fn)

		for (const fn of this.#subscriptions.get(item) ?? [])
			this.#enqueue(this.#pendingReactions, fn)

		if (this.#batchDepth === 0)
			this.#flush()
	}

	#enqueue(queue: Set<() => void>, fn: () => void) {
		if (this.#busy.has(fn))
			throw new Error("circularity forbidden")

		queue.add(fn)
	}

	/** collect items that were read during fn */
	observe<Value>(fn: () => Value) {
		const seen = new Set<Item>()
		this.#observationLayers.push(seen)
		try {
			const value = fn()
			return {seen, value}
		}
		finally {
			this.#observationLayers.pop()
		}
	}

	/** fn will be called when item changes */
	subscribe(item: Item, fn: () => void) {
		return this.#subscribe(this.#subscriptions, item, fn)
	}

	/** fn will invalidate downstream computed state */
	subscribeInvalidator(item: Item, fn: () => void) {
		return this.#subscribe(this.#invalidators, item, fn)
	}

	#subscribe(
			map: WeakMap<Item, Set<() => void>>,
			item: Item,
			fn: () => void,
		) {

		const fns = guarantee(map, item, () => new Set<() => void>())
		fns.add(fn)

		return () => {
			fns.delete(fn)
			if (fns.size === 0)
				map.delete(item)
		}
	}

	batch = <R>(fn: () => R) => {
		this.#batchDepth++
		try {
			return fn()
		}
		finally {
			this.#batchDepth--
			if (this.#batchDepth === 0)
				this.#flush()
		}
	}

	#run(fn: () => void) {
		if (this.#busy.has(fn))
			throw new Error("circularity forbidden")
		this.#busy.add(fn)
		try { fn() }
		finally { this.#busy.delete(fn) }
	}

	#flush() {
		if (this.#batchDepth || this.#invalidating)
			return

		while (
				this.#pendingInvalidations.size ||
				this.#pendingReactions.size
			) {

			// finish all invalidations before reactions
			this.#invalidating = true

			try {
				while (this.#pendingInvalidations.size) {
					const fn = this.#pendingInvalidations.values().next().value!
					this.#pendingInvalidations.delete(fn)
					this.#run(fn)
				}
			}
			finally {
				this.#invalidating = false
			}

			// execute one reaction, allowing nested flushes
			if (this.#pendingReactions.size) {
				const fn = this.#pendingReactions.values().next().value!
				this.#pendingReactions.delete(fn)
				this.#run(fn)
			}
		}
	}
}


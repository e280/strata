
import {GWeakMap} from "@e280/stz"

export type TrackableItem = object | symbol

/**
 * reactivity integration hub
 */
export class Tracker<Item extends TrackableItem = any> {
	#busy = new Set<() => void>()
	#observationLayers: Set<Item>[] = []
	#subscriptions = new GWeakMap<Item, Set<() => void>>()

	#batchDepth = 0
	#batchPending = new Set<() => void>()

	/** indicate to observers that this item was accessed */
	read(item: Item) {
		const top = this.#observationLayers.at(-1)
		top?.add(item)
	}

	/** invoke all subscriptions for this item */
	write(item: Item) {
		const fns = this.#subscriptions.get(item)
		if (!fns) return

		for (const fn of fns)
			this.#batchPending.add(fn)

		if (this.#batchDepth === 0)
			this.#flush()
	}

	/** collect items that were read during fn */
	observe<R>(fn: () => R) {
		const seen = new Set<Item>()
		this.#observationLayers.push(seen)
		try {
			const ret = fn()
			return {seen, ret}
		}
		finally {
			this.#observationLayers.pop()
		}
	}

	/** fn will be called when item changes */
	subscribe(item: Item, fn: () => void) {
		const fns = this.#subscriptions.guarantee(item, () => new Set())
		fns.add(fn)
		return () => {
			fns.delete(fn)
			if (fns.size === 0)
				this.#subscriptions.delete(item)
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
		while (this.#batchPending.size > 0) {
			const pending = [...this.#batchPending]
			this.#batchPending.clear()

			for (const fn of pending)
				this.#run(fn)
		}
	}
}

/** standard global tracker for integrations */
export const tracker: Tracker = (globalThis as any)[Symbol.for("e280.tracker.2")] ??= new Tracker()



import {guarantee} from "@e280/stz"

export type Trackable = object | symbol

/** reactivity integration hub. invalidate synchronously; react after propagation. */
export class Tracker<Item extends Trackable = any> {
	#busy = new Set<() => void>()
	#observationLayers: Set<Item>[] = []
	#subscriptions = new WeakMap<Item, Set<() => void>>()
	#invalidators = new WeakMap<Item, Set<() => void>>()

	#pendingReactions = new Set<() => void>()
	#batchDepth = 0
	#writeDepth = 0
	#flushing = false

	/** indicate that an item was accessed. */
	read(item: Item) {
		this.#observationLayers.at(-1)?.add(item)
	}

	/** invalidate dependents immediately; defer reactions until propagation finishes. */
	write(item: Item) {
		this.#writeDepth++

		try {
			for (const fn of [...(this.#invalidators.get(item) ?? [])])
				this.#run(fn)

			for (const fn of this.#subscriptions.get(item) ?? []) {
				if (this.#busy.has(fn))
					throw new Error("circularity forbidden")
				this.#pendingReactions.add(fn)
			}
		}
		catch (error) {
			this.#pendingReactions.clear()
			throw error
		}
		finally {
			this.#writeDepth--
		}

		this.#flush()
	}

	/** collect items read while executing a function. */
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

	/** subscribe to reactions, which run after invalidations settle. */
	subscribe(item: Item, fn: () => void) {
		return this.#subscribe(this.#subscriptions, item, fn)
	}

	/** subscribe to synchronous, transitively propagated invalidations. */
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

	/** defer reactions until the outermost batch ends; invalidations remain immediate. */
	batch = <R>(fn: () => R): R => {
		this.#batchDepth++
		try { return fn() }
		finally {
			this.#batchDepth--
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
		if (this.#flushing || this.#batchDepth || this.#writeDepth)
			return

		this.#flushing = true
		const ran = new Set<() => void>()

		try {
			while (this.#pendingReactions.size) {
				const fn = this.#pendingReactions.values().next().value!
				this.#pendingReactions.delete(fn)

				// a reaction can only run once per flush; feedback is damped.
				if (ran.has(fn)) continue
				ran.add(fn)
				this.#run(fn)
			}
		}
		catch (error) {
			// do not run failed-transaction callbacks during a later write.
			this.#pendingReactions.clear()
			throw error
		}
		finally {
			this.#flushing = false
		}
	}
}


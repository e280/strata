
import {sub, Sub} from "@e280/stz"

export type TrackableItem = object | symbol

/**
 * tracking system for state management
 *  - it tracks when items are seen or changed
 *
 * for state item integration (like you're integrating a new kind of state object)
 *  - items can call `tracker.see(this)` when they are accessed
 *  - items can call `tracker.change(this)` when they are reassigned
 *
 * for reactivity integration (like you're integrating a new view library that reacts to state changes)
 *  - run `tracker.seen(renderFn)`, collecting a set of seen items
 *  - loop over each seen item, attach a changed handler `tracker.changed(item, handlerFn)`
 */
export class Tracker<Item extends TrackableItem = any> {
	#seeables: Set<Item>[] = []
	#changeables = new WeakMap<Item, Sub>()
	#changeStack: Set<Promise<void>>[] = []
	#busy = new Set<Item>()

	/** indicate item was accessed */
	see(item: Item) {
		this.#seeables.at(-1)?.add(item)
	}

	/** collect which items were seen during fn */
	seen<R>(fn: () => R) {
		this.#seeables.push(new Set())
		const result = fn()
		const seen = this.#seeables.pop()!
		return {seen, result}
	}

	/** indicate item was changed */
	async change(item: Item) {
		if (this.#busy.has(item))
			throw new Error("circularity forbidden")
		const prom = this.#guaranteeChangeable(item).pub()
		this.#changeStack.at(-1)?.add(prom)
		return prom
	}

	/** respond to changes by calling fn */
	changed(item: Item, fn: () => Promise<void>) {
		return this.#guaranteeChangeable(item)(async() => {
			const collected = new Set<Promise<void>>()
			this.#changeStack.push(collected)
			this.#busy.add(item)
			collected.add(fn())
			this.#busy.delete(item)
			await Promise.all(collected)
			this.#changeStack.pop()
		})
	}

	#guaranteeChangeable(item: Item) {
		let on = this.#changeables.get(item)
		if (!on) {
			on = sub()
			this.#changeables.set(item, on)
		}
		return on
	}
}

const key = Symbol.for("e280.tracker.v2")

/** standard global tracker for integrations */
export const tracker: Tracker = (globalThis as any)[key] ??= new Tracker()


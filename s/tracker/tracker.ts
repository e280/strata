
import {sub, Sub} from "@e280/stz"

export type TrackableItem = object | symbol

/**
 * reactivity integration hub
 */
export class Tracker<Item extends TrackableItem = any> {
	#seeables: Set<Item>[] = []
	#changeables = new WeakMap<Item, Sub>()
	#changeStack: Set<Promise<void>>[] = []
	#busy = new Set<Item>()

	/** indicate item was accessed */
	notifyRead(item: Item) {
		this.#seeables.at(-1)?.add(item)
	}

	/** indicate item was changed */
	async notifyWrite(item: Item) {
		if (this.#busy.has(item))
			throw new Error("circularity forbidden")
		const prom = this.#guaranteeChangeable(item).pub()
		this.#changeStack.at(-1)?.add(prom)
		return prom
	}

	/** collect which items were seen during fn */
	observe<R>(fn: () => R) {
		this.#seeables.push(new Set())
		const result = fn()
		const seen = this.#seeables.pop()!
		return {seen, result}
	}

	/** respond to changes by calling fn */
	subscribe(item: Item, fn: () => Promise<void>) {
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

/** standard global tracker for integrations */
export const tracker: Tracker = (globalThis as any)[Symbol.for("e280.tracker")] ??= new Tracker()


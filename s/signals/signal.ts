
import {SignalOptions} from "./types.js"
import {hipster} from "./parts/hipster.js"
import {Reactive} from "./parts/reactive.js"
import {tracker} from "../tracker/tracker.js"
import {defaultCompare} from "./utils/default-compare.js"

export class Signal<V> extends Reactive<V> {
	#lock = false
	#compare: (a: any, b: any) => boolean

	constructor(value: V, options?: Partial<SignalOptions>) {
		super(value)
		this.#compare = options?.compare ?? defaultCompare
	}

	fn() {
		return hipster(this)
	}

	async set(v: V) {
		const isChanged = !this.#compare(this.sneak, v)
		if (isChanged) await this.publish(v)
		return v
	}

	get value() {
		return this.get()
	}

	set value(v: V) {
		void this.set(v)
	}

	async publish(v = this.sneak) {
		// only wizards are allowed beyond this point.
		// - the implementation is subtle
		// - it looks wrong, but it's right
		// - tarnished alchemists, take heed: lock engages only for sync activity of the async fns (think of the value setter!)

		if (this.#lock)
			throw new Error("forbid circularity")

		let promise: Promise<any> = Promise.resolve()

		try {
			this.#lock = true
			this.sneak = v
			promise = Promise.all([
				tracker.notifyWrite(this),
				this.on.publish(v),
			])
		}
		finally {
			this.#lock = false
		}

		await promise
		return v
	}
}


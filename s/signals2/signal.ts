
import {Reactive} from "./parts/reactive.js"
import {tracker} from "../tracker/tracker.js"
import {SignalOptions} from "../signals/types.js"
import {defaultCompare} from "./utils/default-compare.js"

export class Signal<V> extends Reactive<V> {
	#lock = false
	#compare: (a: any, b: any) => boolean

	constructor(sneak: V, options?: SignalOptions) {
		super(sneak)
		this.#compare = options?.compare ?? defaultCompare
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
		this.set(v)
	}

	async publish(v = this.get()) {
		if (this.#lock) throw new Error("forbid circularity")
		let promise = Promise.resolve()

		try {
			this.#lock = true
			this.sneak = v
			promise = Promise.all([
				tracker.notifyWrite(this),
				this.on.pub(v),
			]) as any
		}
		finally {
			this.#lock = false
		}

		await promise
		return v
	}
}


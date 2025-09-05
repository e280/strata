
import {Reactive} from "./parts/reactive.js"
import {tracker} from "../tracker/tracker.js"
import {SignalFn, SignalOptions} from "./types.js"
import {defaultCompare} from "./utils/default-compare.js"

export class Signal<V> extends Reactive<V> {
	#lock = false
	#compare: (a: any, b: any) => boolean

	constructor(value: V, options?: Partial<SignalOptions>) {
		super(value)
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

	get core() {
		return this
	}

	fn() {
		const that = this as Signal<V>

		function f(): V
		function f(v: V): Promise<V>
		function f(_v?: V): V | Promise<V> {
			return (arguments.length === 0)
				? that.get()
				: that.set(arguments[0])
		}

		f.core = that
		f.get = that.get.bind(that)
		f.set = that.set.bind(that)
		f.on = that.on
		f.dispose = that.dispose.bind(that)
		f.publish = that.publish.bind(that)
		f.fn = that.fn.bind(that)

		Object.defineProperty(f, "value", {
			get: () => that.value,
			set: (v) => that.value = v,
		})

		Object.defineProperty(f, "sneak", {
			get: () => that.sneak,
			set: (v) => that.sneak = v,
		})

		return f as SignalFn<V>
	}
}


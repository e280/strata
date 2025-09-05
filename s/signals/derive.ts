
import {collectorEffect} from "./effect.js"
import {Reactive} from "./parts/reactive.js"
import {tracker} from "../tracker/tracker.js"
import {DeriveFn, SignalOptions} from "./types.js"
import {defaultCompare} from "./utils/default-compare.js"

export class Derive<V> extends Reactive<V> {
	#dispose: () => void

	constructor(formula: () => V, options?: Partial<SignalOptions>) {
		const compare = options?.compare ?? defaultCompare
		const {result, dispose} = collectorEffect(formula, async() => {
			const value = formula()
			const isChanged = !compare(this.sneak, value)
			if (isChanged) {
				this.sneak = value
				await Promise.all([
					tracker.notifyWrite(this),
					this.on.pub(value),
				])
			}
		})
		super(result)
		this.#dispose = dispose
	}

	dispose() {
		super.dispose()
		this.#dispose()
	}

	fn() {
		const that = this as Derive<V>

		function f(): V {
			return that.get()
		}

		f.core = that
		f.get = that.get.bind(that)
		f.on = that.on
		f.dispose = that.dispose.bind(that)
		f.fn = that.fn.bind(that)

		Object.defineProperty(f, "value", {
			get: () => that.value,
		})

		Object.defineProperty(f, "sneak", {
			get: () => that.sneak,
		})

		return f as DeriveFn<V>
	}
}


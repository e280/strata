
import {SignalOptions} from "./types.js"
import {collectorEffect} from "./effect.js"
import {Readable} from "./parts/readable.js"
import {tracker} from "../tracker/tracker.js"
import {defaultCompare} from "./utils/default-compare.js"

export class Lazy<V> extends Readable<V> {
	#formula: () => V
	#compare: (a: any, b: any) => boolean
	#dirty = false
	#effect: (() => void) | undefined

	constructor(formula: () => V, options?: Partial<SignalOptions>) {
		super(undefined as any)
		this.#formula = formula
		this.#compare = options?.compare ?? defaultCompare
	}

	get() {
		if (!this.#effect) {
			const {result, dispose} = collectorEffect(
				this.#formula,
				() => this.#dirty = true,
			)
			this.#effect = dispose
			this.sneak = result
		}
		if (this.#dirty) {
			this.#dirty = false

			const v = this.#formula()
			const isChanged = !this.#compare(this.sneak, v)
			if (isChanged) {
				this.sneak = v
				tracker.notifyWrite(this)
			}
		}
		return super.get()
	}

	dispose() {
		if (this.#effect)
			this.#effect()
	}
}


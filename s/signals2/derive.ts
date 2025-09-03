
import {Reactive} from "./parts/reactive.js"
import {tracker} from "../tracker/tracker.js"
import {SignalOptions} from "../signals/types.js"
import {collectorEffect} from "../signals/effect.js"
import {defaultCompare} from "./utils/default-compare.js"

export class Derive<V> extends Reactive<V> {
	#dispose: () => void

	constructor(formula: () => V, options?: SignalOptions) {
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

	get value() {
		return this.get()
	}

	dispose() {
		super.dispose()
		this.#dispose()
	}
}


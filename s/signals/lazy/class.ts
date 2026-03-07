
import {lazy} from "./fn.js"
import {SignalOptions} from "../types.js"
import {tracker} from "../../tracker/tracker.js"
import {collectorEffect} from "../effect/collector-effect.js"
import {_compare, _dirty, _effect, _formula} from "../utils/symbols.js"

export interface Lazy<Value> {
	(): Value
}

export class Lazy<Value> {
	sneak!: Value
	;[_formula]!: () => Value
	;[_dirty]!: boolean
	;[_effect]!: (() => void) | undefined
	;[_compare]!: (a: any, b: any) => boolean

	constructor(formula: () => Value, options?: Partial<SignalOptions>) {
		if (new.target !== Lazy) throw new Error("Lazy cannot be subclassed")
		return lazy(formula, options)
	}

	get value() {
		return this.get()
	}

	get() {
		if (!this[_effect]) {
			const {result, dispose} = collectorEffect(
				this[_formula],
				() => this[_dirty] = true,
			)
			this[_effect] = dispose
			this.sneak = result
		}
		if (this[_dirty]) {
			this[_dirty] = false

			const v = this[_formula]()
			const isChanged = !this[_compare](this.sneak, v)
			if (isChanged) {
				this.sneak = v
				tracker.notifyWrite(this)
			}
		}

		tracker.notifyRead(this)
		return this.sneak
	}

	dispose() {
		if (this[_effect])
			this[_effect]()
	}

	toString() {
		return `($lazy "${String(this.get())}")`
	}
}



import {lazy} from "./fn.js"
import {SignalOptions} from "../types.js"
import {tracker} from "../../tracker/tracker.js"
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
			const {seen, result} = tracker.observe(this[_formula])
			const fn = async() => { this[_dirty] = true }
			let disposers: (() => void)[] = []
			for (const saw of seen)
				disposers.push(tracker.subscribe(saw, fn))
			this.sneak = result
			tracker.notifyWrite(this)
			this[_effect] = () => disposers.forEach(d => d())
		}

		if (this[_dirty]) {
			this[_dirty] = false
			const value = this[_formula]()
			const isChanged = !this[_compare](this.sneak, value)
			if (isChanged) {
				this.sneak = value
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


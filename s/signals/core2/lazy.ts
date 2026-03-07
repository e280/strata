
import {SignalOptions} from "../types.js"
import {tracker} from "../../tracker/tracker.js"
import {collectorEffect} from "./effect.js"
import {defaultCompare} from "../utils/default-compare.js"

const _dirty = Symbol()
const _effect = Symbol()
const _compare = Symbol()
const _formula = Symbol()

export function lazy<Value>(formula: () => Value, options?: Partial<SignalOptions>) {
	function fn(): Value {
		return (fn as Lazy<Value>).get()
	}

	Object.setPrototypeOf(fn, Lazy.prototype)
	fn.sneak = undefined
	fn[_formula] = formula
	fn[_dirty] = false
	fn[_effect] = undefined
	fn[_compare] = options?.compare ?? defaultCompare

	return fn as Lazy<Value>
}

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


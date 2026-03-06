
import {sub, Sub} from "@e280/stz"
import {SignalOptions} from "../types.js"
import {tracker} from "../../tracker/tracker.js"
import {collectorEffect} from "../core/effect.js"
import {defaultCompare} from "../utils/default-compare.js"

export function derived<Value>(formula: () => Value, options?: Partial<SignalOptions>) {
	function fn(): Value {
		return (fn as Derived<Value>).get()
	}

	const compare = options?.compare ?? defaultCompare

	Object.setPrototypeOf(fn, Derived.prototype)
	fn.on = sub<[Value]>()

	const {result, dispose} = collectorEffect(formula, async() => {
		const value = formula()
		const isChanged = !compare(fn.sneak, value)
		if (isChanged) {
			fn.sneak = value
			await Promise.all([
				tracker.notifyWrite(fn),
				fn.on.pub(value),
			])
		}
	})

	fn.sneak = result
	fn.dispose = dispose

	return fn as Derived<Value>
}

export interface Derived<Value> {
	(): Value
}

export class Derived<Value> {
	sneak!: Value
	on!: Sub<[Value]>
	dispose!: () => void

	constructor(formula: () => Value, options?: Partial<SignalOptions>) {
		if (new.target !== Derived) throw new Error("Signal cannot be subclassed")
		return derived(formula, options)
	}

	get value() {
		return (this as Derived<any>).get()
	}

	get() {
		tracker.notifyRead(this)
		return this.sneak
	}

	toString() {
		return `(derived "${String(this.get())}")`
	}
}


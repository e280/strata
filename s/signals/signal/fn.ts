
import {sub} from "@e280/stz"
import {Signal} from "./class.js"
import {lazy} from "../lazy/fn.js"
import {SignalOptions} from "../types.js"
import {derived} from "../derived/fn.js"
import {_compare, _lock} from "../utils/symbols.js"
import {defaultCompare} from "../utils/default-compare.js"

export function signal<Value>(value: Value, options?: Partial<SignalOptions>) {
	function fn(): Value
	function fn(value: Value): Promise<Value>
	function fn(_value?: Value): Value | Promise<Value> {
		const self = fn as Signal<Value>
		return (arguments.length === 0)
			? self.get()
			: self.set(arguments[0])
	}

	Object.setPrototypeOf(fn, Signal.prototype)
	fn.sneak = value
	fn.on = sub<[Value]>()
	fn[_lock] = false
	fn[_compare] = options?.compare ?? defaultCompare

	return fn as Signal<Value>
}

signal.derived = derived
signal.lazy = lazy


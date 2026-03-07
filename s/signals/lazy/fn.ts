
import {Lazy} from "./class.js"
import {SignalOptions} from "../types.js"
import {defaultCompare} from "../utils/default-compare.js"
import {_compare, _dirty, _disposers, _effect, _formula} from "../utils/symbols.js"

export function lazy<Value>(formula: () => Value, options?: Partial<SignalOptions>) {
	function fn(): Value {
		return (fn as Lazy<Value>).get()
	}

	Object.setPrototypeOf(fn, Lazy.prototype)
	fn.sneak = undefined
	fn[_formula] = formula
	fn[_dirty] = false
	fn[_effect] = undefined
	fn[_disposers] = [] as any
	fn[_compare] = options?.compare ?? defaultCompare

	return fn as Lazy<Value>
}


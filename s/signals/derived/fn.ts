
import {sub} from "@e280/stz"
import {Derived} from "./class.js"
import {watch} from "../effect/watch.js"
import {SignalOptions} from "../types.js"
import {tracker} from "../../tracker/tracker.js"
import {defaultCompare} from "../utils/default-compare.js"

export function derived<Value>(formula: () => Value, options?: Partial<SignalOptions>) {
	function fn(): Value {
		return (fn as Derived<Value>).get()
	}

	const compare = options?.compare ?? defaultCompare

	Object.setPrototypeOf(fn, Derived.prototype)
	fn.on = sub<[Value]>()

	const {result, dispose} = watch(formula, async() => {
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


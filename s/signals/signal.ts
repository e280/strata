
import {Subby, subby} from "@e280/stz"
import {Signal} from "./types.js"
import {tracker} from "../tracker/global.js"

export function signal<Value>(value: Value): Signal<Value> {
	let on: undefined | Subby<[Value]>

	function sig() {
		if (arguments.length === 0) {
			tracker.read(sig)
			return value
		}
		else {
			value = arguments[0]
			tracker.write(sig)
			on?.publish(value)
			return value
		}
	}

	sig.get = () => sig()
	sig.set = (value: Value) => (<any>sig)(value)
	sig.on = (fn: (value: Value) => void) => (on ??= subby())(fn)

	return sig
}


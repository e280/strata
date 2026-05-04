
import {Signal} from "./types.js"
import {tracker} from "../tracker/tracker.js"

export function signal<Value>(value: Value): Signal<Value> {
	return function sig() {
		if (arguments.length === 0) {
			tracker.read(sig)
			return value
		}
		else {
			value = arguments[0]
			tracker.write(sig)
			return value
		}
	}
}



import {tracker} from "../tracker/tracker.js"

export type Signal<Value> = {
	(): Value
	(value: Value): Value
}

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


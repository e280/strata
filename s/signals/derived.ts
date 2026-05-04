
import {Derived} from "./types.js"
import {watch} from "./utils/watch.js"
import {tracker} from "../tracker/global.js"

export function derived<Value>(fn: () => Value): Derived<Value> {
	let value!: Value
	let dirty = true
	let unwatch = () => {}

	const dispose = () => {
		unwatch()
		unwatch = () => {}
		dirty = true
	}

	const invalidate = () => {
		if (!dirty) {
			dirty = true
			tracker.write(d)
		}
	}

	const compute = () => {
		const watched = watch(fn, invalidate)

		unwatch()
		unwatch = watched.dispose

		value = watched.value
		dirty = false
	}

	function d() {
		tracker.read(d)

		if (dirty)
			compute()

		return value
	}

	d.dispose = dispose
	return d
}


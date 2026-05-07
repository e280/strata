
import {Derived} from "./types.js"
import {watch} from "./utils/watch.js"
import {tracker} from "../tracker/global.js"

export function derived<Value>(fn: () => Value): Derived<Value> {
	let value!: Value
	let dirty = true
	let failed = false
	let computing = false
	let unwatch = () => {}

	const dispose = () => {
		unwatch()
		unwatch = () => {}
		dirty = true
	}

	const invalidate = () => {
		if (!dirty || failed) {
			dirty = true
			tracker.write(d)
		}
	}

	const compute = () => {
		if (computing)
			throw new Error("derived circularity forbidden")

		computing = true
		try {
			const watched = watch(fn, () => invalidate())

			unwatch()
			unwatch = watched.dispose

			value = watched.value
			dirty = false
			failed = false
		}
		catch (error) {
			failed = true
			throw error
		}
		finally {
			computing = false
		}
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


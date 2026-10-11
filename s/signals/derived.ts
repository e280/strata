
import {once} from "@e280/stz"
import {Derived} from "./types.js"
import {tracker} from "../tracker/global.js"
import {watchInvalidator} from "./utils/watch.js"

export function derived<Value>(fn: () => Value): Derived<Value> {
	let value!: Value
	let dirty = true
	let failed = false
	let computing = false
	let unwatch = () => {}
	let disposed = false

	const dispose = once(() => {
		disposed = true
		unwatch()
		unwatch = () => {}
	})

	const assertAlive = () => {
		if (disposed)
			throw new Error("derived has been disposed")
	}

	const invalidate = () => {
		if (disposed) return
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
			const watched = watchInvalidator(fn, () => invalidate())

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
		assertAlive()
		tracker.read(d)

		if (dirty)
			compute()

		return value
	}

	d.get = () => d()
	d.dispose = dispose

	d.on = (fn: (value: Value) => unknown) => {
		assertAlive()
		if (dirty) compute()
		return tracker.subscribe(d, () => fn(d()))
	}

	return d
}


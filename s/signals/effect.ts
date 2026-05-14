
import {watch} from "./utils/watch.js"

export function effect(fn: () => void) {
	let unwatch = () => {}

	const dispose = () => {
		unwatch()
		unwatch = () => {}
	}

	const update = () => {
		dispose()
		const watched = watch(fn, update)
		unwatch = watched.dispose
	}

	update()

	return dispose
}


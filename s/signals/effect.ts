
import {watch} from "./utils/watch.js"

export function effect<Value>(
		collector: () => Value,
		responder?: (value: Value) => void,
	) {

	let first = true
	let unwatch = () => {}

	const dispose = () => {
		unwatch()
		unwatch = () => {}
	}

	const update = () => {
		dispose()
		const watched = watch(collector, update)
		unwatch = watched.dispose
		if (!first)
			responder?.(watched.value)
	}

	update()

	first = false
	return dispose
}


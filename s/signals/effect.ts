
import {watch} from "./utils/watch.js"

export function effect<Collected>(
		collector: () => Collected,
		responder: (collected: Collected) => void = () => {},
	) {

	let unwatch = () => {}

	const dispose = () => {
		unwatch()
		unwatch = () => {}
	}

	const update = () => {
		dispose()
		const watched = watch(collector, update)
		unwatch = watched.dispose
		responder(watched.value)
	}

	const watched = watch(collector, update)
	unwatch = watched.dispose

	return dispose
}


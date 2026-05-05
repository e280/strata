
import {effect} from "../effect.js"

export function afterEffect<C>(
		collector: () => C,
		responder: (collected: C) => void,
	) {

	let initialized = false

	return effect(() => {
		const collected = collector()

		if (initialized)
			responder(collected)

		initialized = true
	})
}


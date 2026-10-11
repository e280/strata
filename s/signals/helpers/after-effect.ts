
import {effect} from "../effect.js"

/** @deprecated use `effect` instead, it now takes collector and responder. */
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


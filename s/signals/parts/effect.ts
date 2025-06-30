
import {debounce} from "@e280/stz"
import {tracker} from "../../tracker/tracker.js"

export function effect<C = void>(collector: () => C, responder: () => void = collector) {
	return initEffect<C>(collector, responder).dispose
}

export function initEffect<C = void>(collector: () => C, responder: () => void = collector) {
	const {seen, result} = tracker.seen(collector)
	const fn1 = debounce(0, responder)

	const disposers: (() => void)[] = []
	const dispose = () => disposers.forEach(d => d())

	for (const saw of seen) {
		const dispose = tracker.changed(saw, fn1)
		disposers.push(dispose)
	}

	return {result, dispose}
}


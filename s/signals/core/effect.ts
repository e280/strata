
import {debounce} from "@e280/stz"
import {tracker} from "../../tracker/tracker.js"

export function effect(
		collector: () => void,
		responder: () => void = collector,
	) {

	return collectorEffect(collector, responder).dispose
}

export function collectorEffect<C = void>(
		collector: () => C,
		responder: () => void = collector,
	) {

	const {seen, result} = tracker.observe(collector)
	const fn = debounce(0, responder)

	const disposers: (() => void)[] = []
	const dispose = () => disposers.forEach(d => d())

	for (const saw of seen) {
		const dispose = tracker.subscribe(saw, fn)
		disposers.push(dispose)
	}

	return {result, dispose}
}


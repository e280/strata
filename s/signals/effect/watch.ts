
import {microbounce} from "@e280/stz"
import {tracker} from "../../tracker/tracker.js"

export function watch<Value>(
		collector: () => Value,
		responder?: (value: Value) => void,
	) {

	let disposers: (() => void)[] = []

	const dispose = () => {
		for (const d of disposers) d()
		disposers = []
	}

	const run = () => {
		const {seen, result} = tracker.observe(collector)
		for (const saw of seen)
			disposers.push(tracker.subscribe(saw, reset))
		return result
	}

	const reset = microbounce(() => {
		dispose()
		if (responder) responder(run())
		else run()
	})

	return {result: run(), dispose}
}


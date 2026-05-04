
import {tracker} from "../../tracker/global.js"

export function watch<Value>(collector: () => Value, onChange: () => void) {
	const {seen, value} = tracker.observe(collector)
	const disposers = [...seen].map(item => tracker.subscribe(item, onChange))
	const dispose = () => disposers.forEach(d => d())
	return {value, dispose}
}


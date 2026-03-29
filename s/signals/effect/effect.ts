
import {watch} from "./watch.js"

export function effect<Value>(
		collector: () => Value,
		responder?: (value: Value) => void,
	) {

	return watch(collector, responder).dispose
}


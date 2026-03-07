
import {watch} from "./watch.js"

export function effect(collector: () => void, responder?: () => void) {
	return watch(collector, responder).dispose
}


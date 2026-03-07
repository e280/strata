
import {collectorEffect} from "./collector-effect.js"

export function effect(
		collector: () => void,
		responder: () => void = collector,
	) {

	return collectorEffect(collector, responder).dispose
}


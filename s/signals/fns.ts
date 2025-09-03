
import {Lazy} from "./lazy.js"
import {Signal} from "./signal.js"
import {Derive} from "./derive.js"
import {SignalOptions} from "./types.js"

export function lazy<V>(
		formula: () => V,
		options?: Partial<SignalOptions>,
	) {
	return new Lazy<V>(formula, options)
}

export function derive<V>(
		formula: () => V,
		options?: Partial<SignalOptions>,
	) {
	return new Derive<V>(formula, options)
}

export function signal<V>(
		value: V,
		options?: Partial<SignalOptions>,
	) {
	return new Signal<V>(value, options)
}

signal.lazy = lazy
signal.derive = derive


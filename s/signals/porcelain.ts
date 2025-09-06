
import {Lazy} from "./lazy.js"
import {Signal} from "./signal.js"
import {Derived} from "./derived.js"
import {SignalOptions} from "./types.js"

export function lazy<V>(
		formula: () => V,
		options?: Partial<SignalOptions>,
	) {
	return new Lazy<V>(formula, options).fn()
}

export function derived<V>(
		formula: () => V,
		options?: Partial<SignalOptions>,
	) {
	return new Derived<V>(formula, options).fn()
}

export function signal<V>(
		value: V,
		options?: Partial<SignalOptions>,
	) {
	return new Signal<V>(value, options).fn()
}

signal.lazy = lazy
signal.derived = derived


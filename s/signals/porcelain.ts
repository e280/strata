
import {SignalOptions} from "./types.js"
import {Lazy} from "./core/lazy.js"
import {Signal} from "./core/signal.js"
import {Derived} from "./core/derived.js"

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


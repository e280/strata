
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

lazy.fn = <V>(
	formula: () => V,
	options?: Partial<SignalOptions>,
) => lazy(formula, options).fn()

export function derive<V>(
		formula: () => V,
		options?: Partial<SignalOptions>,
	) {
	return new Derive<V>(formula, options)
}

derive.fn = <V>(
	formula: () => V,
	options?: Partial<SignalOptions>,
) => derive(formula, options).fn()

export function signal<V>(
		value: V,
		options?: Partial<SignalOptions>,
	) {
	return new Signal<V>(value, options)
}

signal.lazy = lazy
signal.derive = derive
signal.fn = <V>(value: V, options?: Partial<SignalOptions>) => (
	new Signal(value, options).fn()
)


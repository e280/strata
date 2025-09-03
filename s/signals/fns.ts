
import {Lazy} from "./lazy.js"
import {Signal} from "./signal.js"
import {Derive} from "./derive.js"
import {SignalFn, SignalOptions} from "./types.js"

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

signal.fn = <V>(value: V) => {
	const sig = new Signal<V>(value)

	function f(): V
	function f(v: V): Promise<V>
	function f(_v?: V): V | Promise<V> {
		return (arguments.length === 0)
			? sig.get()
			: sig.set(arguments[0])
	}

	f.on = sig.on
	f.set = sig.set.bind(sig)
	f.publish = sig.publish.bind(sig)
	f.dispose = sig.dispose.bind(sig)

	Object.setPrototypeOf(f, {
		set: sig.set.bind(sig),
		publish: sig.publish.bind(sig),
	})

	Object.defineProperty(f, "value", {
		get: () => sig.value,
		set: (v) => sig.value = v,
	})

	Object.defineProperty(f, "sneak", {
		get: () => sig.sneak,
		set: (v) => sig.sneak = v,
	})

	return f as SignalFn<V>
}



import {SignalOptions} from "./types.js"
import {LazyCore, processSignalOptions} from "./units.js"

export type LazySignal<V> = {
	(): V
	kind: "lazy"

	sneak: V
	get(): V
	get value(): V
	dispose(): void
}

export function lazy<V>(formula: () => V, options: Partial<SignalOptions> = {}) {
	function fn(): V {
		return (fn as any).value
	}

	const o = processSignalOptions(options)
	const core = new LazyCore<V>(formula, o)
	Object.setPrototypeOf(fn, LazyCore.prototype)
	Object.assign(fn, core)

	return fn as LazySignal<V>
}


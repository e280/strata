
import {DeriveOptions, LazyCore} from "./units.js"

export type LazySignal<V> = {
	(): V
	kind: "lazy"

	sneak: V
	get(): V
	get value(): V
	dispose(): void
}

export function lazy<V>(formula: () => V, options: Partial<DeriveOptions> = {}) {
	const compare = options.compare ?? ((a, b) => a === b)

	function fn(): V {
		return (fn as any).value
	}

	const core = new LazyCore<V>(formula, {compare})
	Object.setPrototypeOf(fn, LazyCore.prototype)
	Object.assign(fn, core)

	return fn as LazySignal<V>
}


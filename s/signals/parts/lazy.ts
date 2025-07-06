
import {LazyCore} from "./units.js"

export type Lazy<V> = {
	(): V
	kind: "lazy"

	sneak: V
	get(): V
	get value(): V
	dispose(): void
}

export function lazy<V>(formula: () => V) {

	function fn(): V {
		return (fn as any).value
	}

	const core = new LazyCore<V>(formula)
	Object.setPrototypeOf(fn, LazyCore.prototype)
	Object.assign(fn, core)

	return fn as Lazy<V>
}


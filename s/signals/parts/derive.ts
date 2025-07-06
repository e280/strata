
import {Sub} from "@e280/stz"
import {DerivedCore, DeriveOptions} from "./units.js"

export type DerivedSignal<V> = {
	(): V
	kind: "derived"

	sneak: V
	on: Sub<[V]>
	get(): V
	get value(): V
	dispose(): void
}

export function derive<V>(formula: () => V, options: Partial<DeriveOptions> = {}) {
	const compare = options.compare ?? ((a, b) => a === b)

	function fn(): V {
		return (fn as any).value
	}

	const core = DerivedCore.make<V>(fn as any, formula, {compare})
	Object.setPrototypeOf(fn, DerivedCore.prototype)
	Object.assign(fn, core)

	return fn as DerivedSignal<V>
}


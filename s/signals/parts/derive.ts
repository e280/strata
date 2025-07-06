
import {Sub} from "@e280/stz"
import {DerivedCore} from "./units.js"

export type Derive<V> = {
	(): V
	kind: "derived"

	sneak: V
	on: Sub<[V]>
	get(): V
	get value(): V
	dispose(): void
}

export function derive<V>(formula: () => V) {
	function fn(): V {
		return (fn as any).value
	}

	const core = DerivedCore.make<V>(fn as any, formula)
	Object.setPrototypeOf(fn, DerivedCore.prototype)
	Object.assign(fn, core)

	return fn as Derive<V>
}


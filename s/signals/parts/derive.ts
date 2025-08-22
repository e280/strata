
import {Sub} from "@e280/stz"
import {SignalOptions} from "../types.js"
import {DerivedCore, processSignalOptions} from "./units.js"

export type DerivedSignal<V> = {
	(): V
	kind: "derived"

	sneak: V
	on: Sub<[V]>
	get(): V
	get value(): V
	dispose(): void
}

export function derive<V>(formula: () => V, options: Partial<SignalOptions> = {}) {
	function fn(): V {
		return (fn as any).value
	}

	const o = processSignalOptions(options)
	const core = DerivedCore.make<V>(fn as any, formula, o)
	Object.setPrototypeOf(fn, DerivedCore.prototype)
	Object.assign(fn, core)

	return fn as DerivedSignal<V>
}


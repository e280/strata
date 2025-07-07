
import {Sub} from "@e280/stz"

import {lazy} from "./lazy.js"
import {derive} from "./derive.js"
import {SignalOptions} from "./types.js"
import {processSignalOptions, SignalCore} from "./units.js"

export type Signal<V> = {
	(): V
	(v: V): Promise<void>
	(v?: V): V | Promise<void>

	kind: "signal"

	sneak: V
	value: V
	on: Sub<[V]>
	get(): V
	set(v: V): Promise<void>
	publish(v?: V): Promise<void>
	dispose(): void
} & SignalCore<V>

export function signal<V>(value: V, options: Partial<SignalOptions> = {}) {
	function fn(): V
	function fn(v: V): Promise<void>
	function fn(v?: V): V | Promise<void> {
		return v !== undefined
			? (fn as any).set(v)
			: (fn as any).get()
	}

	const o = processSignalOptions(options)
	const core = new SignalCore(value, o)
	Object.setPrototypeOf(fn, SignalCore.prototype)
	Object.assign(fn, core)

	return fn as Signal<V>
}

signal.lazy = lazy
signal.derive = derive


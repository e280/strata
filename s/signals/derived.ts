
import {Derived} from "./types.js"
import {effect} from "./effect.js"

export function derived<Value>(fn: () => Value) {
	const d = (() => fn()) as Derived<Value>
	d.get = d
	d.on = sub => effect(fn, sub)
	d.dispose = () => {}
	return d
}


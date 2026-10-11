
import {On} from "@e280/stz"
import {Derived} from "./types.js"
import {afterEffect} from "./helpers/after-effect.js"

export function derived<Value>(fn: () => Value): Derived<Value> {
	const d = () => fn()
	d.get = d
	d.on = <On<[value: Value]>>(sub => afterEffect(fn, sub))
	d.dispose = () => {} // deprecated
	return d
}


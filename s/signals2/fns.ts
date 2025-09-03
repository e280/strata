
import {Lazy} from "./lazy.js"
import {Signal} from "./signal.js"
import {Derive} from "./derive.js"

export function lazy<V>(formula: () => V) {
	return new Lazy<V>(formula)
}

export function derive<V>(formula: () => V) {
	return new Derive<V>(formula)
}

export function signal<V>(value: V) {
	return new Signal<V>(value)
}

signal.lazy = lazy
signal.derive = derive


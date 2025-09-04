
import {Lazy} from "./lazy.js"
import {Signal} from "./signal.js"
import {Derive} from "./derive.js"

export type Signaly<V> = Signal<V> | Derive<V> | Lazy<V>

export type SignalOptions = {
	compare: (a: any, b: any) => boolean
}

// hipster syntax types

export type SignalFn<V> = {
	(): V
	(v: V): Promise<V>
	(v?: V): V | Promise<V>

	signal: Signal<V>
} & Signal<V>

export type LazyFn<V> = {
	(): V
	lazy: Lazy<V>
} & Lazy<V>

export type DeriveFn<V> = {
	(): V
	derive: Derive<V>
} & Derive<V>


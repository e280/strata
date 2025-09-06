
import {Lazy} from "./lazy.js"
import {Signal} from "./signal.js"
import {Derived} from "./derived.js"

export type Signaly<V> = Signal<V> | Derived<V> | Lazy<V>
export type SignalyFn<V> = SignalFn<V> | DerivedFn<V> | LazyFn<V>

export type SignalOptions = {
	compare: (a: any, b: any) => boolean
}

export type SignalFn<V> = {
	(): V
	(v: V): Promise<V>
	(v?: V): V | Promise<V>

	core: Signal<V>
} & Signal<V>

export type LazyFn<V> = {
	(): V
	core: Lazy<V>
} & Lazy<V>

export type DerivedFn<V> = {
	(): V
	core: Derived<V>
} & Derived<V>


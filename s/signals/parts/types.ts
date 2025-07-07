
import {Signal} from "./signal.js"
import {LazySignal} from "./lazy.js"
import {DerivedSignal} from "./derive.js"

export type Signaloid<V> = Signal<V> | DerivedSignal<V> | LazySignal<V>

export type SignalOptions = {
	compare: (a: any, b: any) => boolean
}


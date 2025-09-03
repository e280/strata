
import {Lazy} from "./lazy.js"
import {Signal} from "./signal.js"
import {Derive} from "./derive.js"

export type Signaly<V> = Signal<V> | Derive<V> | Lazy<V>

export type SignalOptions = {
	compare: (a: any, b: any) => boolean
}



import {Lazy} from "./core2/lazy.js"
import {Signal} from "./core2/signal.js"
import {Derived} from "./core2/derived.js"

export type Signaly<Value> = Signal<Value> | Derived<Value> | Lazy<Value>

export type SignalOptions = {
	compare: (a: any, b: any) => boolean
}


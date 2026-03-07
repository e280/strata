
import {Lazy} from "./lazy/class.js"
import {Signal} from "./signal/class.js"
import {Derived} from "./derived/class.js"

export type Signaly<Value> = Signal<Value> | Derived<Value> | Lazy<Value>

export type SignalOptions = {
	compare: (a: any, b: any) => boolean
}


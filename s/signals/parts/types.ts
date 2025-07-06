
import {Lazy} from "./lazy.js"
import {Signal} from "./signal.js"
import {Derive} from "./derive.js"

export type Signaloid<V> = Signal<V> | Derive<V> | Lazy<V>


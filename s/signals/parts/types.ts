
import {Signal} from "./signal.js"
import {Computed} from "./computed.js"

export type Signalish<V> = Signal<V> | Computed<V>


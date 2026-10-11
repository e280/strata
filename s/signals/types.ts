
import {On} from "@e280/stz"

export type Signal<Value> = {
	(): Value
	<V extends Value>(value: V): V
	get(): Value
	set<V extends Value>(value: V): V
	on: On<[value: Value]>
}

export type Derived<Value> = {
	(): Value
	get(): Value
	on: On<[value: Value]>

	/** @deprecated disposing deriveds is not a thing anymore. delete this. */
	dispose: () => void
}

export type Valuable<Value> = Signal<Value> | Derived<Value>


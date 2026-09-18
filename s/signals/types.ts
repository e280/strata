
export type Signal<Value> = {
	(): Value
	<V extends Value>(value: V): V
	get(): Value
	set<V extends Value>(value: V): V
}

export type Derived<Value> = {
	(): Value
	dispose: () => void
	get(): Value
}

export type Valuable<Value> = Signal<Value> | Derived<Value>


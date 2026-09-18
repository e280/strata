
export type Signal<Value> = {
	(): Value
	(value: Value): Value
	get(): Value
	set(value: Value): Value
}

export type Derived<Value> = {
	(): Value
	dispose: () => void
	get(): Value
}

export type Valuable<Value> = Signal<Value> | Derived<Value>



import {Sub} from "@e280/stz"
import {effect} from "./effect.js"
import {ReactiveSignal} from "./signal.js"

export type Derive<V> = {
	(): V
	kind: "derived"

	sneak: V
	on: Sub<[V]>
	get(): V
	get value(): V
	dispose(): void
}

export function derive<V>(formula: () => V) {
	function fn(): V {
		return (fn as any).value
	}

	const core = new DerivedCore<V>(formula)
	Object.setPrototypeOf(fn, DerivedCore.prototype)
	Object.assign(fn, core)

	return fn as Derive<V>
}

export class DerivedCore<V> extends ReactiveSignal<V> {
	kind: "derived" = "derived"

	_formula: () => V
	_effect: () => void

	constructor(formula: () => V) {
		super(undefined as any)
		this._formula = formula
		this._effect = effect(formula, async() => {
			const value = formula()
			this.sneak = value
			await this.on.pub(value)
		})
	}

	get value() {
		return this.get()
	}

	dispose() {
		super.dispose()
		if (this._effect)
			this._effect()
	}
}


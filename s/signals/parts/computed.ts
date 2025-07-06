
import {tracker} from "@e280/stz"
import {initEffect} from "./effect.js"
import {SignalBase} from "./signal.js"

export type Computed<V> = {(): V} & ComputedCore<V>

export function computed<V>(fn: () => V) {
	const core = new ComputedCore<V>(fn)

	function f(): V {
		return (f as any).value
	}

	Object.setPrototypeOf(f, ComputedCore.prototype)
	Object.assign(f, core)

	return f as Computed<V>
}

export class ComputedCore<V> extends SignalBase<V> {
	_dirty = false
	_formula: () => V
	_effect: (() => void) | undefined

	constructor(formula: () => V) {
		super(undefined as any)
		this._formula = formula
	}

	get() {
		if (!this._effect) {
			const {result, dispose} = initEffect(this._formula, () => this._dirty = true)
			this._effect = dispose
			this.sneak = result
		}
		if (this._dirty) {
			this._dirty = false

			const v = this._formula()
			if (v !== this.sneak) {
				this.sneak = v
				tracker.change(this)
			}
		}
		return super.get()
	}

	async set() {
		throw new Error("computed is readonly")
	}

	dispose() {
		if (this._effect)
			this._effect()
	}
}


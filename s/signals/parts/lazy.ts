
import {tracker} from "@e280/stz"
import {ReadableSignal} from "./signal.js"
import {collectorEffect} from "./effect.js"

export type Lazy<V> = {
	(): V
	kind: "lazy"

	sneak: V
	get(): V
	get value(): V
	dispose(): void
}

export function lazy<V>(formula: () => V) {
	const core = new LazyCore<V>(formula)

	function fn(): V {
		return (fn as any).value
	}

	Object.setPrototypeOf(fn, LazyCore.prototype)
	Object.assign(fn, core)

	return fn as Lazy<V>
}

export class LazyCore<V> extends ReadableSignal<V> {
	kind: "lazy" = "lazy"

	_dirty = false
	_formula: () => V
	_effect: (() => void) | undefined

	constructor(formula: () => V) {
		super(undefined as any)
		this._formula = formula
	}

	get() {
		if (!this._effect) {
			const {result, dispose} = collectorEffect(this._formula, () => this._dirty = true)
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

	get value() {
		return this.get()
	}

	dispose() {
		if (this._effect)
			this._effect()
	}
}


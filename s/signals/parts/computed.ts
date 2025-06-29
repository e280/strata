
import {Effect} from "./effect.js"
import {PlainSignal} from "./signal.js"

export type Computed<V> = {(): V} & PlainComputed<V>

export function computed<V>(fn: () => V) {
	const plain = new PlainComputed<V>(fn)

	function f(): V {
		return plain.value
	}

	Object.setPrototypeOf(f, PlainComputed.prototype)
	Object.assign(f, plain)

	const f2 = f as Computed<V>
	PlainComputed.init(f2)

	return f2
}

export class PlainComputed<V> extends PlainSignal<V> {
	static init<V>(self: Computed<V>) {
		self._effect = new Effect(self._formula, () => self._dirty = true)
		self.sneak = self._effect.initial
	}

	_dirty = false
	_formula: () => V
	_effect!: Effect<V>

	constructor(formula: () => V) {
		super(undefined as any)
		this._formula = formula
	}

	get value() {
		if (this._dirty) {
			this._dirty = false
			super.value = this._formula()
		}
		return super.value
	}

	set value(_) {
		throw new Error("computed is readonly")
	}

	get wait() {
		return this._effect.wait
	}

	dispose() {
		this._effect.dispose()
		super.dispose()
	}
}



import {Effect} from "./effect.js"
import {SignalCore} from "./signal.js"

export type Computed<V> = {(): V} & ComputedCore<V>

export function computed<V>(fn: () => V) {
	const core = new ComputedCore<V>(fn)

	function f(): V {
		return (f as any).value
	}

	Object.setPrototypeOf(f, ComputedCore.prototype)
	Object.assign(f, core)

	const f2 = f as Computed<V>
	ComputedCore.init(f2)

	return f2
}

export class ComputedCore<V> extends SignalCore<V> {
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

	get() {
		if (this._dirty) {
			this._dirty = false
			super.set(this._formula())
		}
		return super.get()
	}

	async set() {
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

